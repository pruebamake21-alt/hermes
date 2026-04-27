import type { Metadata } from "next";
import Link from "next/link";
import { PropertyForm } from "./property-form";

export const metadata: Metadata = { title: "Nuevo Inmueble" };

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuevo Inmueble</h1>
          <p className="text-muted-foreground">Añade una nueva propiedad</p>
        </div>
        <Link
          href="/dashboard/properties"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver
        </Link>
      </div>

      <PropertyForm />
    </div>
  );
}
