/**
 * Smart Match — cross-references lead requirements with available properties.
 * Returns scored and ranked property matches so agents can prioritize follow-ups.
 */

export interface MatchResult {
  propertyId: string;
  score: number; // 0–100
  label: string; // e.g. "92% — Excelente";

  // Breakdown for tooltip / detail
  breakdown: {
    operationType: number;  // /30
    budget: number;         // /30
    availability: number;   // /20
    urgency: number;        // /10
    location: number;       // /10
  };
  details: string[]; // human-readable reasons
}

interface ScorableProperty {
  id: string;
  operationType: string;
  propertyType: string;
  price: number;
  status: string;
  city: string | null;
  zone: string | null;
  bedrooms: number | null;
  title: string | null;
}

interface ScorableLead {
  tipoConsulta: string;
  presupuesto: number | null;
  urgencia: string;
  notas: string | null;
  notasAgente: string | null;
}

const OPERATION_MAP: Record<string, string[]> = {
  comprar: ["VENTA"],
  alquilar: ["ALQUILER", "ALQUILER_VACACIONAL"],
  vender: [],
  tasar: [],
  otro: ["VENTA", "ALQUILER", "ALQUILER_VACACIONAL"],
};

function normalizeToken(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Heuristic: extract zone mentions from free-text notes */
function extractZone(text: string): string | null {
  const candidates = text.match(/(?:zona|barrio|zona de)\s+([a-záéíóúñ\s]+?)(?:,|\.|$)/i);
  return candidates ? candidates[1].trim() : null;
}

export function scoreMatch(lead: ScorableLead, property: ScorableProperty): MatchResult | null {
  const breakdown = { operationType: 0, budget: 0, availability: 0, urgency: 0, location: 0 };
  const details: string[] = [];
  const op = lead.tipoConsulta;

  // ── 1. Operation type (max 30) ───────────────────────────
  const validOps = OPERATION_MAP[op] ?? [];
  if (validOps.length === 0) return null; // lead wants to sell/tasar — no match

  if (validOps.includes(property.operationType)) {
    breakdown.operationType = 30;
    details.push(`Tipo de operación coincide (${property.operationType})`);
  } else {
    breakdown.operationType = 0;
    details.push(`Tipo de operación diferente (busca ${op}, es ${property.operationType})`);
  }

  // ── 2. Budget vs price (max 30) ──────────────────────────
  if (lead.presupuesto && lead.presupuesto > 0) {
    const budget = Number(lead.presupuesto);
    const price = Number(property.price);
    if (price <= budget) {
      const ratio = price / budget;
      if (ratio >= 0.8) {
        breakdown.budget = 30;
        details.push(`Precio dentro del presupuesto (${price.toLocaleString("es-ES")} € ≤ ${budget.toLocaleString("es-ES")} €)`);
      } else {
        // Well under budget —  good but less ideal (might be too small/cheap)
        breakdown.budget = 20;
        details.push(`Precio muy por debajo del presupuesto`);
      }
    } else {
      // Over budget — score decays quickly
      const overRatio = (price - budget) / budget;
      const pts = Math.max(0, Math.round(30 * (1 - overRatio)));
      breakdown.budget = pts;
      if (pts > 0) {
        details.push(`Ligeramente por encima del presupuesto (${(overRatio * 100).toFixed(0)}% más)`);
      } else {
        details.push(`Excede el presupuesto (${(overRatio * 100).toFixed(0)}% más caro)`);
      }
    }
  } else {
    // No budget specified — neutral score
    breakdown.budget = 15;
    details.push("Presupuesto no especificado");
  }

  // ── 3. Availability (max 20) ─────────────────────────────
  if (property.status === "DISPONIBLE") {
    breakdown.availability = 20;
    details.push("Inmueble disponible");
  } else if (property.status === "RESERVADO") {
    breakdown.availability = 5;
    details.push("Inmueble reservado (poca disponibilidad)");
  } else {
    breakdown.availability = 0;
    details.push("Inmueble no disponible");
  }

  // ── 4. Urgency bonus (max 10) ────────────────────────────
  if (lead.urgencia === "inmediata") {
    breakdown.urgency = 10;
    // Urgent leads get a slight boost for available properties
    if (property.status === "DISPONIBLE") details.push("Lead urgente — priorizar");
  } else if (lead.urgencia === "primer_mes") {
    breakdown.urgency = 5;
  }

  // ── 5. Zone / location (max 10) ──────────────────────────
  const noteText = [lead.notas, lead.notasAgente].filter(Boolean).join(" ");

  // Check city match first
  if (property.city) {
    const propCityNorm = normalizeToken(property.city);
    const noteLower = normalizeToken(noteText);
    if (noteLower.includes(propCityNorm)) {
      breakdown.location = 10;
      details.push(`Ciudad coincide: ${property.city}`);
    }
  }

  // If no city match, check zone
  if (breakdown.location === 0) {
    const mentionedZone = extractZone(noteText);
    if (mentionedZone && property.zone) {
      const propZoneNorm = normalizeToken(property.zone);
      const mentionedNorm = normalizeToken(mentionedZone);
      if (propZoneNorm.includes(mentionedNorm) || mentionedNorm.includes(propZoneNorm)) {
        breakdown.location = 10;
        details.push(`Zona coincide: ${property.zone}`);
      }
    } else if (property.zone) {
      breakdown.location = 5;
      details.push(`Ubicado en ${property.zone}, ${property.city || ""}`);
    }
  }

  // If no match at all, just show location info
  if (breakdown.location === 0 && (property.city || property.zone)) {
    breakdown.location = 3;
    details.push(`Ubicación: ${[property.city, property.zone].filter(Boolean).join(", ")}`);
  }

  const total = breakdown.operationType + breakdown.budget +
    breakdown.availability + breakdown.urgency + breakdown.location;

  // Don't show matches with score < 20 unless they match operation type
  if (total < 20 && breakdown.operationType < 30) return null;

  const pct = Math.round((total / 100) * 100);

  return {
    propertyId: property.id,
    score: total,
    label: `${pct}%${pct >= 70 ? " — Excelente" : pct >= 45 ? " — Posible" : " — Baja"}`,
    breakdown,
    details,
  };
}

export function smartMatch(lead: ScorableLead, properties: ScorableProperty[]): MatchResult[] {
  return properties
    .map((p) => scoreMatch(lead, p))
    .filter((m): m is MatchResult => m !== null)
    .sort((a, b) => b.score - a.score);
}
