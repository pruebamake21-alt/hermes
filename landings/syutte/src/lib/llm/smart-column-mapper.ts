/**
 * Smart Column Mapper — uses an LLM to auto-detect which CSV columns map to
 * which property fields. Designed for the "Importación Inteligente" flow.
 */

import { llmChat } from "./client";
import type { LlmConfig } from "./client";

const VALID_FIELDS = [
  "title", "description", "price", "operationType", "propertyType",
  "currency", "status", "usableSurface", "builtSurface", "bedrooms",
  "bathrooms", "toilets", "floor", "hasElevator", "terrace", "balcony",
  "garage", "storageRoom", "pool", "airConditioning", "heating",
  "energyCert", "address", "city", "latitude", "longitude", "zone",
] as const;

export interface ColumnMapping {
  csvColumn: string;
  targetField: string | null; // null = skip this column
  confidence: "alta" | "media" | "baja";
}

export interface SmartMappingResult {
  mappings: ColumnMapping[];
  unmappedColumns: string[];
  explanation: string;
}

const SYSTEM_PROMPT = `Eres un asistente experto en importación de datos inmobiliarios.
Tu tarea es mapear columnas de un archivo CSV a los campos del sistema.

Campos válidos del sistema (con descripciones):
- title: Título del inmueble
- description: Descripción del inmueble
- price: Precio (número)
- operationType: Tipo de operación (VENTA, ALQUILER, ALQUILER_VACACIONAL)
- propertyType: Tipo de inmueble (PISO, CASA, LOCAL, OFICINA, TERRENO)
- currency: Moneda (EUR, USD, etc.)
- status: Estado (DISPONIBLE, RESERVADO, VENDIDO, ALQUILADO)
- usableSurface: Metros útiles (número)
- builtSurface: Metros construidos (número)
- bedrooms: Habitaciones (número)
- bathrooms: Baños (número)
- toilets: Aseos (número)
- floor: Planta
- hasElevator: Ascensor (sí/no)
- terrace: Terraza (sí/no)
- balcony: Balcón (sí/no)
- garage: Garaje (sí/no)
- storageRoom: Trastero (sí/no)
- pool: Piscina (sí/no)
- airConditioning: Aire acondicionado (sí/no)
- heating: Calefacción (sí/no)
- energyCert: Certificado energético (A-G)
- address: Dirección
- city: Ciudad
- latitude: Latitud (número)
- longitude: Longitud (número)
- zone: Zona/Barrio

Responde ÚNICAMENTE con un JSON válido en este formato:
{
  "mappings": [
    { "csvColumn": "Precio", "targetField": "price", "confidence": "alta" },
    { "csvColumn": "Direccion", "targetField": "address", "confidence": "alta" },
    { "csvColumn": "Notas", "targetField": null, "confidence": "baja" }
  ],
  "unmappedColumns": ["Notas"],
  "explanation": "Se mapearon 12 de 13 columnas. 'Notas' no tiene un campo equivalente en el sistema."
}

REGLAS:
- Si una columna no corresponde a ningún campo del sistema, pon targetField como null.
- No inventes campos. Usa solo los listados arriba.
- Confianza 'alta' = coincidencia clara, 'media' = aproximación, 'baja' = dudosa.`;

export async function smartMapColumns(
  csvHeaders: string[],
  sampleRows: Record<string, string>[],
  llmConfig: LlmConfig
): Promise<SmartMappingResult> {
  const userPrompt = `Columnas del CSV: ${JSON.stringify(csvHeaders)}\n\nPrimeras ${sampleRows.length} filas como ejemplo:\n${JSON.stringify(sampleRows, null, 2)}\n\nGenera el mapeo de columnas al sistema.`;

  const response = await llmChat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    llmConfig,
    { temperature: 0.1 }
  );

  // Strip markdown code fences if present
  const cleaned = response.content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let result: SmartMappingResult;
  try {
    result = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("El LLM no devolvió un JSON válido");
    }
  }

  // Validate target fields — drop any not in our list
  for (const m of result.mappings) {
    if (m.targetField !== null && !(VALID_FIELDS as readonly string[]).includes(m.targetField)) {
      m.targetField = null;
      m.confidence = "baja";
    }
  }

  return result;
}
