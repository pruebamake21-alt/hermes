/**
 * Data access layer — uses Prisma when configured, falls back to demo data.
 */

import { isDemoMode, DEMO_STATS, DEMO_PROJECTS, DEMO_TEAM, DEMO_REVENUE_DATA, DEMO_ACTIVITY, DEMO_INVOICES, DEMO_USER, DEMO_PROPERTIES, DEMO_LEADS, DEMO_CALLS, DEMO_METRICS, DEMO_MONTHLY_DATA } from "./demo-data";

interface AppUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: string;
}

export async function getCurrentUser(): Promise<AppUser> {
  if (isDemoMode()) return DEMO_USER;

  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("./auth");
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return {
        id: (session.user as any).id ?? "unknown",
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        tenantId: (session.user as any).tenantId ?? "default",
        role: (session.user as any).role ?? "MEMBER",
      };
    }
  } catch {}

  return DEMO_USER;
}

export async function getStats(_tenantId: string) {
  if (isDemoMode()) return DEMO_STATS;
  // In production: query database
  return DEMO_STATS;
}

export async function getMetrics(_tenantId: string) {
  if (isDemoMode()) return DEMO_METRICS;
  return DEMO_METRICS;
}

export async function getMonthlyData(_tenantId: string) {
  if (isDemoMode()) return DEMO_MONTHLY_DATA;
  return DEMO_MONTHLY_DATA;
}

export async function getRecentProjects(_tenantId: string) {
  if (isDemoMode()) return DEMO_PROJECTS;
  return DEMO_PROJECTS;
}

export async function getTeamMembers(_tenantId: string) {
  if (isDemoMode()) return DEMO_TEAM;
  return DEMO_TEAM;
}

export async function getRevenueData(_tenantId: string) {
  if (isDemoMode()) return DEMO_REVENUE_DATA;
  return DEMO_REVENUE_DATA;
}

export async function getActivity(_tenantId: string) {
  if (isDemoMode()) return DEMO_ACTIVITY;
  return DEMO_ACTIVITY;
}

export async function getInvoices(_customerId: string) {
  if (isDemoMode()) return DEMO_INVOICES;
  return DEMO_INVOICES;
}

// ─── Properties ───────────────────────────────────────────

export async function getProperties(tenantId: string) {
  if (isDemoMode()) return DEMO_PROPERTIES;

  const { prisma } = await import("./prisma");
  return prisma.property.findMany({
    where: { tenantId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProperty(id: string, tenantId: string) {
  if (isDemoMode()) {
    return DEMO_PROPERTIES.find((p) => p.id === id) || null;
  }

  const { prisma } = await import("./prisma");
  return prisma.property.findFirst({
    where: { id, tenantId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function createProperty(data: {
  tenantId: string;
  userId: string;
  operationType: any;
  propertyType: any;
  price: number;
  currency: string;
  status?: any;
  title?: string;
  city?: string;
  description?: string;
  usableSurface?: number;
  builtSurface?: number;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  floor?: string;
  hasElevator?: boolean;
  terrace?: boolean;
  balcony?: boolean;
  garage?: boolean;
  storageRoom?: boolean;
  pool?: boolean;
  airConditioning?: boolean;
  heating?: boolean;
  energyCert?: any;
  address?: string;
  latitude?: number;
  longitude?: number;
  zone?: string;
  hideExactAddress?: boolean;
  photos?: string[];
}) {
  if (isDemoMode()) {
    return { id: "demo-new-" + Date.now(), ...data, createdAt: new Date().toISOString() };
  }

  const { prisma } = await import("./prisma");
  return prisma.property.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      operationType: data.operationType,
      propertyType: data.propertyType,
      price: data.price,
      currency: data.currency,
      status: data.status || "DISPONIBLE",
      title: data.title,
      city: data.city,
      description: data.description,
      usableSurface: data.usableSurface,
      builtSurface: data.builtSurface,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      toilets: data.toilets,
      floor: data.floor,
      hasElevator: data.hasElevator || false,
      terrace: data.terrace || false,
      balcony: data.balcony || false,
      garage: data.garage || false,
      storageRoom: data.storageRoom || false,
      pool: data.pool || false,
      airConditioning: data.airConditioning || false,
      heating: data.heating || false,
      energyCert: data.energyCert,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      zone: data.zone,
      hideExactAddress: data.hideExactAddress || false,
      photos: data.photos || [],
    },
  });
}

export async function updateProperty(
  id: string,
  tenantId: string,
  data: Partial<{
    operationType: any;
    propertyType: any;
    price: number;
    currency: string;
    status: any;
    title: string;
    city: string;
    description: string;
    usableSurface: number;
    builtSurface: number;
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    floor: string;
    hasElevator: boolean;
    terrace: boolean;
    balcony: boolean;
    garage: boolean;
    storageRoom: boolean;
    pool: boolean;
    airConditioning: boolean;
    heating: boolean;
    energyCert: any;
    address: string;
    latitude: number;
    longitude: number;
    zone: string;
    hideExactAddress: boolean;
    photos: string[];
  }>,
) {
  if (isDemoMode()) return { id, ...data };

  const { prisma } = await import("./prisma");
  return prisma.property.updateMany({
    where: { id, tenantId },
    data,
  });
}

export async function deleteProperty(id: string, tenantId: string) {
  if (isDemoMode()) return true;

  const { prisma } = await import("./prisma");
  await prisma.property.deleteMany({
    where: { id, tenantId },
  });
  return true;
}

// ─── Leads ────────────────────────────────────────────────

export async function getLeads(tenantId: string) {
  if (isDemoMode()) return DEMO_LEADS;

  const { prisma } = await import("./prisma");
  return prisma.lead.findMany({
    where: { tenantId },
    include: {
      user: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLead(id: string, tenantId: string) {
  if (isDemoMode()) return DEMO_LEADS.find((l) => l.id === id) || null;

  const { prisma } = await import("./prisma");
  return prisma.lead.findFirst({
    where: { id, tenantId },
    include: {
      user: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } },
      calls: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateLead(
  id: string,
  tenantId: string,
  data: Partial<{
    estado: any;
    notasAgente: string;
    ultimoContacto: Date;
  }>,
) {
  if (isDemoMode()) return { id, ...data };

  const { prisma } = await import("./prisma");
  return prisma.lead.updateMany({ where: { id, tenantId }, data });
}

// ─── Smart Match ─────────────────────────────────────────

export async function getSmartMatches(leadId: string, tenantId: string) {
  if (isDemoMode()) {
    const { smartMatch } = await import("./smart-match");
    const lead = DEMO_LEADS.find((l) => l.id === leadId);
    if (!lead) return [];
    return smartMatch(
      {
        tipoConsulta: lead.tipoConsulta,
        presupuesto: lead.presupuesto ? Number(lead.presupuesto) : null,
        urgencia: lead.urgencia,
        notas: lead.notas,
        notasAgente: lead.notasAgente,
      },
      DEMO_PROPERTIES.filter((p) => p.status !== "VENDIDO" && p.status !== "ALQUILADO").map((p) => ({
        id: p.id,
        operationType: p.operationType,
        propertyType: p.propertyType,
        price: Number(p.price),
        status: p.status,
        zone: p.zone ?? null,
        city: p.city ?? null,
        bedrooms: p.bedrooms ?? null,
        title: p.title ?? null,
      })),
    );
  }

  const { prisma } = await import("./prisma");
  const { smartMatch } = await import("./smart-match");
  const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId } });
  if (!lead) return [];

  const properties = await prisma.property.findMany({
    where: { tenantId, status: { in: ["DISPONIBLE", "RESERVADO"] } },
  });

  return smartMatch(
    {
      tipoConsulta: lead.tipoConsulta,
      presupuesto: lead.presupuesto ? Number(lead.presupuesto) : null,
      urgencia: lead.urgencia,
      notas: lead.notas,
      notasAgente: lead.notasAgente,
    },
    properties.map((p) => ({
      id: p.id,
      operationType: p.operationType,
      propertyType: p.propertyType,
      price: Number(p.price),
      status: p.status,
      zone: p.zone ?? null,
      city: p.city ?? null,
      bedrooms: p.bedrooms ?? null,
      title: p.title ?? null,
    })),
  );
}

// ─── Calls ────────────────────────────────────────────────

export async function getCalls(tenantId: string) {
  if (isDemoMode()) return DEMO_CALLS;

  const { prisma } = await import("./prisma");
  return prisma.call.findMany({
    where: { tenantId },
    include: { lead: { select: { id: true, nombre: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCall(id: string, tenantId: string) {
  if (isDemoMode()) return DEMO_CALLS.find((c) => c.id === id) || null;

  const { prisma } = await import("./prisma");
  return prisma.call.findFirst({
    where: { id, tenantId },
    include: { lead: { select: { id: true, nombre: true } } },
  });
}

// ─── Appointments ───────────────────────────────────────

export async function getAppointments(tenantId: string) {
  if (isDemoMode()) {
    return DEMO_LEADS.filter((l) => l.estado === "Visita_programada").map((l) => ({
      id: `app-${l.id}`,
      title: `Visita: ${l.nombre}`,
      leadId: l.id,
      leadName: l.nombre,
      leadPhone: l.telefono,
      propertyId: l.propertyId || null,
      propertyTitle: l.property?.title || null,
      notes: l.notasAgente || "",
      startDate: l.ultimoContacto || l.createdAt,
      endDate: l.ultimoContacto || l.createdAt,
      status: "scheduled",
      createdBy: "manual",
    }));
  }

  const { prisma } = await import("./prisma");
  const appointments = await prisma.appointment.findMany({
    where: { tenantId },
    include: {
      lead: { select: { id: true, nombre: true, telefono: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return appointments.map((a) => ({
    id: a.id,
    title: a.title,
    leadId: a.leadId,
    leadName: a.lead?.nombre || null,
    leadPhone: a.lead?.telefono || null,
    propertyId: null,
    propertyTitle: null,
    notes: a.description || "",
    startDate: a.startDate.toISOString(),
    endDate: a.endDate.toISOString(),
    status: a.status,
    createdBy: a.createdBy,
  }));
}
