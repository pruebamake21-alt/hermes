"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/data";

function requireAdmin(user: { role: string }) {
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    throw new Error("No tienes permisos de administrador");
  }
}

export async function getAdminStats() {
  const user = await getCurrentUser();
  requireAdmin(user);

  // In demo mode, return realistic stats
  if (process.env.DEMO_MODE === "true") {
    return {
      totalTenants: 3,
      totalUsers: 8,
      totalProperties: 47,
      totalLeads: 156,
      totalCalls: 423,
      callsThisMonth: 89,
      leadsThisMonth: 31,
      conversionRate: 18.5,
    };
  }

  const [totalTenants, totalUsers, totalProperties, totalLeads, totalCalls, callsThisMonth, leadsThisMonth] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.property.count(),
    prisma.lead.count(),
    prisma.call.count(),
    prisma.call.count({ where: { createdAt: { gte: new Date(new Date().setDate(1)) } } }),
    prisma.lead.count({ where: { createdAt: { gte: new Date(new Date().setDate(1)) } } }),
  ]);

  return { totalTenants, totalUsers, totalProperties, totalLeads, totalCalls, callsThisMonth, leadsThisMonth, conversionRate: 18.5 };
}

export async function getAdminUsers() {
  const user = await getCurrentUser();
  requireAdmin(user);

  if (process.env.DEMO_MODE === "true") {
    return [
      { id: "1", name: "Sarah Chen", email: "sarah@acme.com", role: "OWNER", tenantName: "Acme Corp", createdAt: new Date("2025-06-01") },
      { id: "2", name: "Marc López", email: "marc@acme.com", role: "ADMIN", tenantName: "Acme Corp", createdAt: new Date("2025-07-15") },
      { id: "3", name: "Ana García", email: "ana@inmo.es", role: "OWNER", tenantName: "Inmobiliaria Centro", createdAt: new Date("2025-09-01") },
      { id: "4", name: "Carlos Ruiz", email: "carlos@inmo.es", role: "MEMBER", tenantName: "Inmobiliaria Centro", createdAt: new Date("2025-10-01") },
      { id: "5", name: "Laura Martínez", email: "laura@casas.es", role: "OWNER", tenantName: "Casas del Sur", createdAt: new Date("2026-01-15") },
    ];
  }

  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, tenant: { select: { name: true } }, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminCalls() {
  const user = await getCurrentUser();
  requireAdmin(user);

  if (process.env.DEMO_MODE === "true") {
    return [
      { id: "c1", tenantName: "Acme Corp", leadName: "Juan Pérez", duracion: 245, satisfaccion: "bien", estado: "completada", createdAt: new Date("2026-04-26") },
      { id: "c2", tenantName: "Inmobiliaria Centro", leadName: "María López", duracion: 120, satisfaccion: "frustrado", estado: "completada", createdAt: new Date("2026-04-25") },
      { id: "c3", tenantName: "Acme Corp", leadName: "Pedro Sánchez", duracion: null, satisfaccion: null, estado: "no_contesta", createdAt: new Date("2026-04-24") },
      { id: "c4", tenantName: "Casas del Sur", leadName: "Ana Ruiz", duracion: 380, satisfaccion: "bien", estado: "completada", createdAt: new Date("2026-04-23") },
    ];
  }

  return prisma.call.findMany({
    select: { id: true, duracion: true, satisfaccion: true, estado: true, createdAt: true, lead: { select: { nombre: true } }, tenant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getAdminReports() {
  const user = await getCurrentUser();
  requireAdmin(user);

  if (process.env.DEMO_MODE === "true") {
    return [
      { tenantName: "Acme Corp", users: 2, properties: 24, leads: 78, calls: 210 },
      { tenantName: "Inmobiliaria Centro", users: 2, properties: 15, leads: 52, calls: 148 },
      { tenantName: "Casas del Sur", users: 1, properties: 8, leads: 26, calls: 65 },
    ];
  }

  const tenants = await prisma.tenant.findMany({
    select: {
      name: true,
      _count: { select: { users: true, properties: true, leads: true, calls: true } },
    },
  });

  return tenants.map((t) => ({
    tenantName: t.name,
    users: t._count.users,
    properties: t._count.properties,
    leads: t._count.leads,
    calls: t._count.calls,
  }));
}

export async function updateVapiConfig(formData: FormData) {
  const user = await getCurrentUser();
  requireAdmin(user);

  const systemPrompt = formData.get("systemPrompt") as string;
  const variables = formData.get("variables") as string;
  const assistantId = formData.get("assistantId") as string;

  // In demo mode, simulate save
  if (process.env.DEMO_MODE === "true") {
    return { success: true };
  }

  // Load existing config
  const existing = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { config: true },
  });

  const currentConfig = (existing?.config as Record<string, any>) || {};

  // Update tenant with Vapi settings
  await prisma.tenant.update({
    where: { id: user.tenantId },
    data: {
      vapiAssistantId: assistantId || undefined,
      config: {
        ...currentConfig,
        systemPrompt: systemPrompt || currentConfig.systemPrompt,
        variables: variables ? JSON.parse(variables) : currentConfig.variables,
      },
    },
  });

  return { success: true };
}
