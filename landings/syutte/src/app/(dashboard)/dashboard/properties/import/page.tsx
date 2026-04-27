import type { Metadata } from "next";
import Link from "next/link";
import { CsvImportClient } from "./csv-import-client";

export const metadata: Metadata = { title: "Importar Inmuebles" };

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Importar Inmuebles</h1>
          <p className="text-muted-foreground">
            Sube un archivo CSV para importar inmuebles en lote.
            Usa <strong>Importación Inteligente</strong> para mapear columnas automáticamente con IA.
          </p>
        </div>
        <Link
          href="/dashboard/properties"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a inmuebles
        </Link>
      </div>

      <CsvImportClient />
    </div>
  );
}
