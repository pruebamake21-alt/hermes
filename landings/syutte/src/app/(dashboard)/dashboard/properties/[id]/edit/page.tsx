import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, getProperty } from "@/lib/data";
import { PropertyForm } from "../../new/property-form";

export const metadata: Metadata = { title: "Editar Inmueble" };

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const property = await getProperty(id, user?.tenantId ?? "demo");

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar Inmueble</h1>
          <p className="text-muted-foreground">{property.title || "Sin título"}</p>
        </div>
        <Link
          href="/dashboard/properties"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver
        </Link>
      </div>

      <PropertyForm defaultValues={property} />
    </div>
  );
}
