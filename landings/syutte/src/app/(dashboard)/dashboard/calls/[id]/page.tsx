import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getCall } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Detalle de Llamada" };

export default async function CallDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const call = await getCall(id, user?.tenantId ?? "demo");

  if (!call) notFound();

  const c = call as any;

  function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const min = Math.floor(seconds / 60);
    const seg = seconds % 60;
    return `${min}:${seg.toString().padStart(2, "0")} min`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Detalle de Llamada</h1>
          <Badge>{c.estado}</Badge>
        </div>
        <Link href="/dashboard/calls">
          <Button variant="ghost">← Volver</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Contacto</span>
              <span className="font-medium">
                {c.lead?.nombre ? (
                  <Link href={`/dashboard/leads/${c.leadId}`} className="text-primary hover:underline">
                    {c.lead.nombre}
                  </Link>
                ) : (
                  c.customerPhone || "Desconocido"
                )}
              </span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Teléfono</span>
              <span className="font-medium">{c.customerPhone || "—"}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Duración</span>
              <span className="font-medium">{formatDuration(c.duracion)}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Inicio</span>
              <span className="font-medium">{c.startedAt ? new Date(c.startedAt).toLocaleString("es-ES") : "—"}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Fin</span>
              <span className="font-medium">{c.endedAt ? new Date(c.endedAt).toLocaleString("es-ES") : "—"}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Coste</span>
              <span className="font-medium">{c.coste ? `${c.coste}€` : "—"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Satisfacción</span>
              <span className="font-medium capitalize">{c.satisfaccion || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {c.resumen || "Sin resumen disponible"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transcripción */}
      <Card>
        <CardHeader>
          <CardTitle>Transcripción</CardTitle>
        </CardHeader>
        <CardContent>
          {c.transcripcion ? (
            <div className="rounded-lg bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                {c.transcripcion}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin transcripción disponible</p>
          )}
        </CardContent>
      </Card>

      {c.grabacionUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Grabación</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full">
              <source src={c.grabacionUrl} type="audio/mpeg" />
              Tu navegador no soporta el reproductor de audio.
            </audio>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
