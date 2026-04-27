import type { Metadata } from "next";
import { getMetrics, getMonthlyData, getActivity, getCurrentUser, getLeads } from "@/lib/data";
import { isDemoMode } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardChart } from "./dashboard-chart";

export const metadata: Metadata = { title: "Dashboard" };

const operationLabels: Record<string, string> = {
  VENTA: "Venta",
  ALQUILER: "Alquiler",
  ALQUILER_VACACIONAL: "Vacacional",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const stats = await getMetrics(user.tenantId);
  const monthly = await getMonthlyData(user.tenantId);
  const activity = await getActivity(user.tenantId);
  const leads = await getLeads(user.tenantId);

  const newLeads = leads.filter((l: any) => l.estado === "Nuevo").slice(0, 5);

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="space-y-8">
      {isDemoMode() && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Demo Mode</strong> — Mostrando datos de ejemplo.
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {user.name}.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Propiedades</p>
            <p className="mt-2 text-3xl font-bold">{stats.totalProperties}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stats.activeProperties} activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Leads</p>
            <p className="mt-2 text-3xl font-bold">{stats.totalLeads}</p>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">+{stats.newLeadsThisMonth} este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Llamadas</p>
            <p className="mt-2 text-3xl font-bold">{stats.totalCalls}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stats.callsThisMonth} este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Conversión</p>
            <p className="mt-2 text-3xl font-bold">{stats.conversionRate}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Precio medio: {formatCurrency(stats.avgPrice)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={monthly} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leads recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {newLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay leads nuevos</p>
            ) : (
              <div className="space-y-4">
                {newLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {lead.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {operationLabels[lead.tipoConsulta] || lead.tipoConsulta}
                        {lead.property?.title ? ` — ${lead.property.title}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
