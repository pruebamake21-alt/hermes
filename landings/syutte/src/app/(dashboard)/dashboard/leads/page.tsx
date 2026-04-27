import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, getLeads } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Leads" };

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Nuevo: "default",
  Contactado: "secondary",
  Visita_programada: "outline",
  Descartado: "destructive",
  Ganado: "default",
};

const canalLabels: Record<string, string> = {
  llamada_telefonica: "📞 Llamada",
  web: "🌐 Web",
  manual: "✏️ Manual",
  whatsapp: "💬 WhatsApp",
};

const urgenciaLabels: Record<string, string> = {
  inmediata: "🔴 Urgente",
  primer_mes: "🟡 Pronto",
  sin_urgencia: "🟢 Sin prisa",
};

export default async function LeadsPage() {
  const user = await getCurrentUser();
  const leads = await getLeads(user?.tenantId ?? "demo");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">{leads.length} leads</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">No hay leads todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Los leads aparecerán cuando recibas llamadas o los añadas manualmente
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead: any) => (
            <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{lead.nombre}</h3>
                        <Badge variant={statusColors[lead.estado] || "outline"}>
                          {lead.estado?.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {canalLabels[lead.canal] || lead.canal}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{lead.telefono}</span>
                        {lead.email && <span>{lead.email}</span>}
                        {lead.presupuesto && (
                          <span className="font-medium text-primary">
                            {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(lead.presupuesto)}
                          </span>
                        )}
                        {lead.property?.title && (
                          <span className="hidden md:inline">{lead.property.title}</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{urgenciaLabels[lead.urgencia] || lead.urgencia}</span>
                        <span>·</span>
                        <span>{new Date(lead.createdAt).toLocaleDateString("es-ES")}</span>
                        {lead.user?.name && (
                          <>
                            <span>·</span>
                            <span>{lead.user.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
