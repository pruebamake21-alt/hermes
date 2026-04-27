import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, getProperties } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Inmuebles" };

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DISPONIBLE: "default",
  RESERVADO: "secondary",
  VENDIDO: "destructive",
  ALQUILADO: "destructive",
};

const statusLabels: Record<string, string> = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  ALQUILADO: "Alquilado",
};

const operationLabels: Record<string, string> = {
  VENTA: "Venta",
  ALQUILER: "Alquiler",
  ALQUILER_VACACIONAL: "Vacacional",
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
    currency: currency,
    maximumFractionDigits: 0,
  });
  const prefix = operationType === "ALQUILER" || operationType === "ALQUILER_VACACIONAL" ? "/mes" : "";
  return fmt.format(price) + prefix;
}

export default async function PropertiesPage() {
  const user = await getCurrentUser();
  const properties = await getProperties(user?.tenantId ?? "demo");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inmuebles</h1>
          <p className="text-muted-foreground">{properties.length} inmuebles</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/properties/import"
            className="rounded-full border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Importar CSV
          </Link>
          <Link
            href="/dashboard/properties/new"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Nuevo Inmueble
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">No hay inmuebles todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primer inmueble para empezar
            </p>
            <Link
              href="/dashboard/properties/new"
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Nuevo Inmueble
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {properties.map((property: any) => (
            <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{property.title || "Sin título"}</h3>
                        <Badge variant={statusColors[property.status] || "outline"}>
                          {statusLabels[property.status] || property.status}
                        </Badge>
                        <Badge variant="outline">
                          {operationLabels[property.operationType] || property.operationType}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {property.description || "Sin descripción"}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="font-semibold text-primary">
                          {formatPrice(Number(property.price), property.currency, property.operationType)}
                        </span>
                        <span className="text-muted-foreground">
                          {typeLabels[property.propertyType] || property.propertyType}
                        </span>
                        {property.bedrooms > 0 && (
                          <span className="text-muted-foreground">{property.bedrooms} hab</span>
                        )}
                        {property.usableSurface && (
                          <span className="text-muted-foreground">{property.usableSurface} m²</span>
                        )}
                        <span className="text-muted-foreground">
                          {[property.city, property.zone].filter(Boolean).join(", ") || "—"}
                        </span>
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
