import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getProperty } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteProperty } from "@/lib/actions/property";

export const metadata: Metadata = { title: "Detalle del Inmueble" };

const statusLabels: Record<string, string> = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  ALQUILADO: "Alquilado",
};

const operationLabels: Record<string, string> = {
  VENTA: "Venta",
  ALQUILER: "Alquiler",
  ALQUILER_VACACIONAL: "Alquiler vacacional",
};

const typeLabels: Record<string, string> = {
  PISO: "Piso",
  CASA: "Casa",
  LOCAL: "Local",
  OFICINA: "Oficina",
  TERRENO: "Terreno",
};

function formatPrice(price: number, currency: string, operationType: string) {
  const fmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  const suffix = operationType === "ALQUILER" || operationType === "ALQUILER_VACACIONAL" ? "/mes" : "";
  return fmt.format(price) + suffix;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const property = await getProperty(id, user?.tenantId ?? "demo");

  if (!property) notFound();

  const p = property as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{p.title || "Sin título"}</h1>
          <p className="text-muted-foreground">
            {typeLabels[p.propertyType]} · {operationLabels[p.operationType]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/properties/${id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form
            action={async () => {
              "use server";
              await deleteProperty(id);
            }}
          >
            <Button variant="destructive" type="submit">Eliminar</Button>
          </form>
          <Link href="/dashboard/properties">
            <Button variant="ghost">← Volver</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Precio y estado */}
        <Card>
          <CardHeader>
            <CardTitle>Precio y Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(Number(p.price), p.currency, p.operationType)}
            </div>
            <div className="flex gap-2">
              <Badge>{statusLabels[p.status] || p.status}</Badge>
              <Badge variant="outline">{operationLabels[p.operationType]}</Badge>
            </div>
            <InfoRow label="Moneda" value={p.currency} />
          </CardContent>
        </Card>

        {/* Características */}
        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Tipo" value={typeLabels[p.propertyType]} />
            <InfoRow label="Metros útiles" value={p.usableSurface ? `${p.usableSurface} m²` : null} />
            <InfoRow label="Metros construidos" value={p.builtSurface ? `${p.builtSurface} m²` : null} />
            <InfoRow label="Habitaciones" value={p.bedrooms} />
            <InfoRow label="Baños" value={p.bathrooms} />
            <InfoRow label="Aseos" value={p.toilets} />
            <InfoRow label="Planta" value={p.floor} />
            <InfoRow label="Cert. energético" value={p.energyCert} />
          </CardContent>
        </Card>

        {/* Extras */}
        <Card>
          <CardHeader>
            <CardTitle>Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Ascensor", p.hasElevator],
                ["Terraza", p.terrace],
                ["Balcón", p.balcony],
                ["Garaje", p.garage],
                ["Trastero", p.storageRoom],
                ["Piscina", p.pool],
                ["A/A", p.airConditioning],
                ["Calefacción", p.heating],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center gap-2 text-sm">
                  <span className={value ? "text-primary" : "text-muted-foreground"}>
                    {value ? "✓" : "○"}
                  </span>
                  <span className={value ? "" : "text-muted-foreground"}>{label as string}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Dirección" value={p.hideExactAddress ? "Ocultada" : p.address} />
            <InfoRow label="Zona" value={p.zone} />
            <InfoRow label="Latitud" value={p.latitude} />
            <InfoRow label="Longitud" value={p.longitude} />
          </CardContent>
        </Card>
      </div>

      {/* Descripción */}
      {p.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadatos */}
      <Card>
        <CardHeader>
          <CardTitle>Información del registro</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Creado por: {p.user?.name || "—"}</p>
          <p>Creado: {new Date(p.createdAt).toLocaleDateString("es-ES")}</p>
          <p>Actualizado: {new Date(p.updatedAt).toLocaleDateString("es-ES")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
