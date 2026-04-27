import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getLead, getCalls } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadsActions as LeadActions } from "./actions";

export const metadata: Metadata = { title: "Detalle del Lead" };

const statusLabels: Record<string, string> = {
  Nuevo: "Nuevo",
  Contactado: "Contactado",
  Visita_programada: "Visita programada",
  Descartado: "Descartado",
  Ganado: "Ganado",
};

const satisfaccionLabels: Record<string, string> = {
  bien: "😊 Bien",
  frustrado: "😤 Frustrado",
  rechazo_ia: "🤖 Rechazo IA",
  indiferente: "😐 Indiferente",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const min = Math.floor(seconds / 60);
  const seg = seconds % 60;
  return `${min}:${seg.toString().padStart(2, "0")} min`;
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const lead = await getLead(id, user?.tenantId ?? "demo");
  const calls = await getCalls(user?.tenantId ?? "demo");

  if (!lead) notFound();

  const leadCalls = calls.filter((c: any) => c.leadId === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{lead.nombre}</h1>
            <Badge>{statusLabels[lead.estado] || lead.estado}</Badge>
          </div>
          <p className="text-muted-foreground">{lead.telefono}</p>
        </div>
        <div className="flex items-center gap-2">
          <LeadActions leadId={id} currentStatus={lead.estado} />
          <Link href={`/dashboard/leads/${id}/smart-match`}>
            <Button variant="secondary" size="sm">🎯 Smart Match</Button>
          </Link>
          <Link href="/dashboard/leads">
            <Button variant="ghost">← Volver</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información del contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información del contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Teléfono</span>
              <span className="font-medium">{lead.telefono}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{lead.email || "—"}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Canal</span>
              <span className="font-medium">{lead.canal?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Idioma</span>
              <span className="font-medium">{lead.idioma === "es" ? "Español" : "English"}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Presupuesto</span>
              <span className="font-medium">
                {lead.presupuesto
                  ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(lead.presupuesto))
                  : "No especificado"}
              </span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Financiación</span>
              <span className="font-medium">{lead.financiacion ? "Sí" : "No"}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Urgencia</span>
              <span className="font-medium">
                {{ inmediata: "Inmediata", primer_mes: "En un mes", sin_urgencia: "Sin urgencia" }[lead.urgencia] || lead.urgencia}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Tipo de consulta</span>
              <span className="font-medium">{lead.tipoConsulta}</span>
            </div>
          </CardContent>
        </Card>

        {/* Inmueble relacionado */}
        <Card>
          <CardHeader>
            <CardTitle>Inmueble relacionado</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.property?.title ? (
              <Link
                href={`/dashboard/properties/${lead.propertyId}`}
                className="text-primary hover:underline"
              >
                {lead.property.title}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Sin inmueble asociado</p>
            )}
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>Creado: {new Date(lead.createdAt).toLocaleString("es-ES")}</p>
              <p>Último contacto: {lead.ultimoContacto ? new Date(lead.ultimoContacto).toLocaleString("es-ES") : "—"}</p>
              <p>Agente: {lead.user?.name || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notas de la conversación */}
        <Card>
          <CardHeader>
            <CardTitle>Notas de la conversación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {lead.notas || "Sin notas de conversación"}
            </p>
          </CardContent>
        </Card>

        {/* Notas del agente */}
        <Card>
          <CardHeader>
            <CardTitle>Notas del agente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {lead.notasAgente || "Sin notas del agente"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Llamadas relacionadas */}
      {leadCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Llamadas ({leadCalls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {leadCalls.map((call: any) => (
                <Link
                  key={call.id}
                  href={`/dashboard/calls/${call.id}`}
                  className="flex items-center justify-between py-3 hover:bg-accent/50 px-2 -mx-2 rounded"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{call.estado}</span>
                      {call.satisfaccion && (
                        <span className="text-sm text-muted-foreground">
                          {satisfaccionLabels[call.satisfaccion] || call.satisfaccion}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {call.resumen || "Sin resumen"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatDuration(call.duracion)}</p>
                    <p>{call.startedAt ? new Date(call.startedAt).toLocaleDateString("es-ES") : "—"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
