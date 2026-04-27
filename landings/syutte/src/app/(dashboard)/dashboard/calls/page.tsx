import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, getCalls } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Llamadas" };

const satisfaccionLabels: Record<string, string> = {
  bien: "😊",
  frustrado: "😤",
  rechazo_ia: "🤖",
  indiferente: "😐",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completada: "default",
  fallida: "destructive",
  no_contesta: "secondary",
  ocupado: "secondary",
};

const statusLabels: Record<string, string> = {
  completada: "Completada",
  fallida: "Fallida",
  no_contesta: "No contesta",
  ocupado: "Ocupado",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const min = Math.floor(seconds / 60);
  const seg = seconds % 60;
  return `${min}:${seg.toString().padStart(2, "0")}`;
}

export default async function CallsPage() {
  const user = await getCurrentUser();
  const calls = await getCalls(user?.tenantId ?? "demo");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Llamadas</h1>
          <p className="text-muted-foreground">{calls.length} llamadas</p>
        </div>
      </div>

      {calls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">No hay llamadas todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Las llamadas aparecerán cuando el agente de Vapi reciba llamadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {calls.map((call: any) => (
            <Link key={call.id} href={`/dashboard/calls/${call.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {call.satisfaccion ? satisfaccionLabels[call.satisfaccion] || "📞" : "📞"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {call.lead?.nombre || call.customerPhone || "Desconocido"}
                          </span>
                          <Badge variant={statusColors[call.estado] || "outline"}>
                            {statusLabels[call.estado] || call.estado}
                          </Badge>
                        </div>
                        {call.resumen && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {call.resumen}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="font-mono">{formatDuration(call.duracion)}</p>
                      <p>{call.startedAt ? new Date(call.startedAt).toLocaleDateString("es-ES") : "—"}</p>
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
