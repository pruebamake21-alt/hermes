"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminStats, getAdminUsers, getAdminCalls, getAdminReports, updateVapiConfig } from "@/lib/actions/admin";

type Tab = "dashboard" | "usuarios" | "vapi" | "llamadas" | "reportes";

const tabs: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "usuarios", label: "Usuarios" },
  { id: "vapi", label: "Voz / Vapi" },
  { id: "llamadas", label: "Llamadas" },
  { id: "reportes", label: "Reportes" },
];

export function AdminClient() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vapiPrompt, setVapiPrompt] = useState("");
  const [vapiVars, setVapiVars] = useState("");
  const [vapiAssistantId, setVapiAssistantId] = useState("");
  const [vapiSaving, setVapiSaving] = useState(false);

  const providerName = "Vapi"; // Could be dynamic in the future
  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/voice/webhook`
    : "/api/voice/webhook";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, u, c, r] = await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminCalls(),
          getAdminReports(),
        ]);
        setStats(s);
        setUsers(u);
        setCalls(c);
        setReports(r);

        // Default Vapi config
        setVapiPrompt(
          `Eres un asistente virtual de una agencia inmobiliaria llamada {{businessName}}.\n\n` +
          `Debes atender llamadas de clientes interesados en {{propertyTypes}}.\n\n` +
          `Tu tono debe ser {{assistantTone}}.\n\n` +
          `Saluda siempre con: "{{greetingMessage}}"\n\n` +
          `Recoge: nombre, teléfono, email, tipo de inmueble que busca, presupuesto aproximado y urgencia.\n\n` +
          `Si no sabes algo, di que un agente contactará pronto.`
        );
        setVapiVars(JSON.stringify({
          businessName: "businessName",
          businessPhone: "businessPhone",
          assistantTone: "profesional | cercano | entusiasta",
          greetingMessage: "greetingMessage",
          propertyTypes: "lista separada por comas",
        }, null, 2));
      } catch (e: any) {
        alert("Error al cargar datos: " + e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveVapi() {
    setVapiSaving(true);
    try {
      const fd = new FormData();
      fd.set("systemPrompt", vapiPrompt);
      fd.set("variables", vapiVars);
      fd.set("assistantId", vapiAssistantId);
      await updateVapiConfig(fd);
      toast.success("Configuración guardada correctamente");
    } catch {
      toast.error("Error al guardar la configuración");
    } finally {
      setVapiSaving(false);
    }
  }

  const satisfactionLabels: Record<string, string> = { bien: "😊 Bien", frustrado: "😤 Frustrado", rechazo_ia: "🤖 Rechazo IA", indiferente: "😐 Indiferente" };
  const statusLabels: Record<string, string> = { completada: "Completada", fallida: "Fallida", no_contesta: "No contesta", ocupado: "Ocupado" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión global del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <>
          {/* Tab: Dashboard */}
          {tab === "dashboard" && stats && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tenants</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totalTenants}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Usuarios</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totalUsers}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Propiedades</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totalProperties}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Leads</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totalLeads}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Llamadas totales</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totalCalls}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Llamadas este mes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.callsThisMonth}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Leads este mes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.leadsThisMonth}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tasa conversión</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.conversionRate}%</p></CardContent></Card>
            </div>
          )}

          {/* Tab: Usuarios */}
          {tab === "usuarios" && (
            <Card>
              <CardHeader><CardTitle>Usuarios del sistema</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 px-2 font-medium text-muted-foreground">Nombre</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Email</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Rol</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Tenant</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{u.name || "—"}</td>
                          <td className="py-2 px-2 text-muted-foreground">{u.email}</td>
                          <td className="py-2 px-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.role === "OWNER" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" :
                              u.role === "ADMIN" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" :
                              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}>{u.role}</span>
                          </td>
                          <td className="py-2 px-2 text-muted-foreground">{u.tenantName || "—"}</td>
                          <td className="py-2 px-2 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("es-ES")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Vapi Config */}
          {tab === "vapi" && (
            <div className="space-y-6">
              {/* Webhook Info */}
              <Card>
                <CardHeader><CardTitle>Webhook URL</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configura esta URL en {providerName} para recibir eventos de llamadas completadas.
                    Proveedor activo: <strong>{providerName}</strong> (via <code>VOICE_PROVIDER</code> env).
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono">
                      {webhookUrl}
                    </code>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => navigator.clipboard.writeText(webhookUrl)}
                    >
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Assistant Config */}
              <Card>
                <CardHeader><CardTitle>Configuración del asistente de voz ({providerName})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Assistant ID</label>
                    <input
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="4e4572e6-79ee-43b4-be60-ba72237f5525"
                      value={vapiAssistantId}
                      onChange={(e) => setVapiAssistantId(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      ID del asistente en Vapi. Se usa para asociar llamadas entrantes al tenant correcto.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">System Prompt</label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      rows={10}
                      value={vapiPrompt}
                      onChange={(e) => setVapiPrompt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Variables (JSON)</label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      rows={6}
                      value={vapiVars}
                      onChange={(e) => setVapiVars(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleSaveVapi} disabled={vapiSaving}>
                      {vapiSaving ? "Guardando..." : "Guardar configuración"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab: Llamadas */}
          {tab === "llamadas" && (
            <Card>
              <CardHeader><CardTitle>Registro global de llamadas</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 px-2 font-medium text-muted-foreground">Tenant</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Lead</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Duración</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Satisfacción</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Estado</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((c: any) => (
                        <tr key={c.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{c.tenantName}</td>
                          <td className="py-2 px-2">{c.leadName || "—"}</td>
                          <td className="py-2 px-2">{c.duracion ? `${Math.floor(c.duracion / 60)}:${(c.duracion % 60).toString().padStart(2, "0")}` : "—"}</td>
                          <td className="py-2 px-2">{satisfactionLabels[c.satisfaccion] || "—"}</td>
                          <td className="py-2 px-2">{statusLabels[c.estado] || c.estado}</td>
                          <td className="py-2 px-2 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("es-ES")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Reportes */}
          {tab === "reportes" && (
            <Card>
              <CardHeader><CardTitle>Reportes por tenant</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 px-2 font-medium text-muted-foreground">Tenant</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Usuarios</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Propiedades</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Leads</th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">Llamadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 px-2 font-medium">{r.tenantName}</td>
                          <td className="py-2 px-2">{r.users}</td>
                          <td className="py-2 px-2">{r.properties}</td>
                          <td className="py-2 px-2">{r.leads}</td>
                          <td className="py-2 px-2">{r.calls}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
