import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getLead, getProperties, getSmartMatches } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Smart Match" };

const operationLabels: Record<string, string> = {
  VENTA: "Venta",
  ALQUILER: "Alquiler",
  ALQUILER_VACACIONAL: "Vacacional",
};

const propertyTypeIcons: Record<string, string> = {
  PISO: "🏢",
  CASA: "🏠",
  LOCAL: "🏪",
  OFICINA: "🏢",
  TERRENO: "🌳",
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-green-500" : score >= 45 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-24 rounded-full bg-muted">
        <div
          className={`h-2.5 rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold">{score}%</span>
    </div>
  );
}

export default async function SmartMatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const lead = await getLead(id, user?.tenantId ?? "demo");
  const allProperties = await getProperties(user?.tenantId ?? "demo");
  const matches = await getSmartMatches(id, user?.tenantId ?? "demo");

  if (!lead) notFound();

  const matchedIds = new Set(matches.map((m) => m.propertyId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Smart Match</h1>
          </div>
          <p className="text-muted-foreground">
            Cruzando "{lead.nombre}" con {allProperties.length} inmuebles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/leads/${id}`}>
            <Button variant="ghost">← Volver al lead</Button>
          </Link>
          <Link href="/dashboard/leads">
            <Button variant="outline">Todos los leads</Button>
          </Link>
        </div>
      </div>

      {/* Lead summary card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>
              <span className="text-muted-foreground">Consulta: </span>
              <strong>{lead.tipoConsulta}</strong>
            </span>
            {lead.presupuesto && (
              <span>
                <span className="text-muted-foreground">Presupuesto: </span>
                <strong>
                  {new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(Number(lead.presupuesto))}
                </strong>
              </span>
            )}
            <span>
              <span className="text-muted-foreground">Urgencia: </span>
              <strong>
                {{
                  inmediata: "Inmediata",
                  primer_mes: "Primer mes",
                  sin_urgencia: "Sin urgencia",
                }[lead.urgencia] || lead.urgencia}
              </strong>
            </span>
            <span>
              <span className="text-muted-foreground">Teléfono: </span>
              <strong>{lead.telefono}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">No se encontraron coincidencias</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ningún inmueble disponible coincide con los criterios de este lead
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {matches.length} coincidencia{matches.length !== 1 ? "s" : ""} ordenadas por relevancia
          </p>

          {matches.map((match) => {
            const prop = allProperties.find(
              (p: any) => p.id === match.propertyId
            ) as any;
            if (!prop) return null;

            return (
              <Card
                key={match.propertyId}
                className={`transition-colors hover:bg-accent/50 ${
                  match.score >= 70
                    ? "border-l-4 border-l-green-500"
                    : match.score >= 45
                      ? "border-l-4 border-l-yellow-500"
                      : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {propertyTypeIcons[prop.propertyType] || "🏠"}
                        </span>
                        <h3 className="font-semibold truncate">
                          {prop.title || `${prop.propertyType} en ${[prop.city, prop.zone].filter(Boolean).join(", ") || "sin ubicación"}`}
                        </h3>
                        <Badge variant="outline">
                          {operationLabels[prop.operationType] || prop.operationType}
                        </Badge>
                        <Badge
                          className={
                            prop.status === "DISPONIBLE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }
                        >
                          {prop.status}
                        </Badge>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                          }).format(Number(prop.price))}
                        </span>
                        {prop.usableSurface && (
                          <span>{prop.usableSurface} m²</span>
                        )}
                        {prop.bedrooms != null && prop.bedrooms > 0 && (
                          <span>{prop.bedrooms} hab.</span>
                        )}
                        {prop.bathrooms != null && prop.bathrooms > 0 && (
                          <span>{prop.bathrooms} baños</span>
                        )}
                        {prop.zone && <span>📍 {[prop.city, prop.zone].filter(Boolean).join(", ")}</span>}
                      </div>

                      {/* Match details */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {match.details.map((d, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold">{match.label}</span>
                      <ScoreBar score={match.score} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Not-matched properties */}
      {allProperties.filter((p: any) => !matchedIds.has(p.id)).length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Inmuebles sin coincidencia (
            {allProperties.filter((p: any) => !matchedIds.has(p.id)).length})
          </summary>
          <div className="mt-3 grid gap-2">
            {allProperties
              .filter((p: any) => !matchedIds.has(p.id))
              .map((prop: any) => (
                <div
                  key={prop.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-2 text-sm text-muted-foreground"
                >
                  <span>
                    {prop.title || prop.propertyType}{prop.city ? ` (${prop.city})` : ""} —{" "}
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(Number(prop.price))}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {operationLabels[prop.operationType] || prop.operationType}
                  </Badge>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}
