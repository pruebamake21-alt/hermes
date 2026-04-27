"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { importProperties } from "@/lib/actions/import-csv";
import { detectColumnsWithLLM, importPropertiesSmart } from "@/lib/actions/import-csv-smart";
import type { SmartMappingResult, ColumnMapping } from "@/lib/llm/smart-column-mapper";

const fieldLabels: Record<string, string> = {
  title: "Título",
  description: "Descripción",
  price: "Precio",
  operationType: "Tipo operación",
  propertyType: "Tipo inmueble",
  currency: "Moneda",
  status: "Estado",
  usableSurface: "Metros útiles",
  builtSurface: "Metros construidos",
  bedrooms: "Habitaciones",
  bathrooms: "Baños",
  toilets: "Aseos",
  floor: "Planta",
  hasElevator: "Ascensor",
  terrace: "Terraza",
  balcony: "Balcón",
  garage: "Garaje",
  storageRoom: "Trastero",
  pool: "Piscina",
  airConditioning: "A/A",
  heating: "Calefacción",
  energyCert: "Cert. energético",
  address: "Dirección",
  city: "Ciudad",
  latitude: "Latitud",
  longitude: "Longitud",
  zone: "Zona",
};

const confidenceColors: Record<string, string> = {
  alta: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  media: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  baja: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function CsvImportClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"normal" | "smart">("normal");
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [fullData, setFullData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number; errorDetails: string[] } | null>(null);
  const [fileName, setFileName] = useState("");

  // Smart import state
  const [llmMapping, setLlmMapping] = useState<SmartMappingResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [editedMappings, setEditedMappings] = useState<ColumnMapping[] | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setLlmMapping(null);
    setEditedMappings(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete(results) {
        setHeaders(results.meta.fields || []);
        setParsedData(results.data.slice(0, 10));
        setFullData(results.data);
      },
      error(err) {
        toast.error("Error al leer el CSV: " + err.message);
      },
    });
  }

  async function handleImport() {
    if (!parsedData) return;
    setImporting(true);

    try {
      if (importMode === "smart" && editedMappings) {
        const res = await importPropertiesSmart(fullData, editedMappings, "demo-user-1");
        setResult(res);
        if (res.success > 0) toast.success(`${res.success} inmuebles importados`);
      } else {
        const res = await importProperties(fullData, "demo-user-1");
        setResult(res);
        if (res.success > 0) toast.success(`${res.success} inmuebles importados`);
      }
    } catch (error: any) {
      toast.error("Error al importar: " + error.message);
    } finally {
      setImporting(false);
    }
  }

  async function handleDetectColumns() {
    if (!headers.length) return;
    setIsDetecting(true);
    try {
      const sampleRows = fullData.slice(0, 3);
      const result = await detectColumnsWithLLM(headers, sampleRows);
      setLlmMapping(result);
      setEditedMappings(result.mappings);
      toast.success("Columnas detectadas con IA");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDetecting(false);
    }
  }

  function updateMapping(index: number, targetField: string | null) {
    setEditedMappings((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index], targetField };
      return next;
    });
  }

  function reset() {
    setParsedData(null);
    setFullData([]);
    setHeaders([]);
    setResult(null);
    setFileName("");
    setLlmMapping(null);
    setEditedMappings(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Render ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!parsedData && !result && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar archivo CSV</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mode selector */}
            <div className="mb-6 flex gap-2 rounded-lg border p-1 bg-muted/30 w-fit">
              <button
                onClick={() => setImportMode("normal")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  importMode === "normal" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Importación Normal
              </button>
              <button
                onClick={() => setImportMode("smart")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  importMode === "smart" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Importación Inteligente (con IA)
              </button>
            </div>

            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              <p className="text-lg font-medium mb-2">Arrastra tu CSV aquí</p>
              <p className="text-sm text-muted-foreground mb-4">o haz clic para seleccionar</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Seleccionar CSV
              </Button>

              <div className="mt-6 w-full max-w-md text-sm text-muted-foreground">
                <p className="font-medium mb-1">Columnas soportadas (auto-detectadas):</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
                  {Object.entries(fieldLabels).map(([key, label]) => (
                    <span key={key}>{label} <span className="text-muted-foreground/50">({key})</span></span>
                  ))}
                </div>
              </div>

              {importMode === "smart" && (
                <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                  💡 En modo inteligente, la IA detectará automáticamente qué columna corresponde a cada campo.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {parsedData && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vista previa ({fileName})</span>
              <Button variant="ghost" size="sm" onClick={reset}>
                Cambiar archivo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">#</th>
                    {headers.map((h) => (
                      <th key={h} className="text-left py-2 px-2 font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 px-2 text-muted-foreground">{i + 1}</td>
                      {headers.map((h) => (
                        <td key={h} className="py-2 px-2 whitespace-nowrap max-w-[200px] truncate">
                          {row[h] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Mostrando las primeras {parsedData.length} filas de {fullData.length}.
            </p>

            {/* Smart: LLM auto-detect */}
            {importMode === "smart" && !llmMapping && (
              <div className="mt-4">
                <Button onClick={handleDetectColumns} disabled={isDetecting}>
                  {isDetecting ? "Detectando columnas..." : "🤖 Auto-detectar columnas con IA"}
                </Button>
              </div>
            )}

            {/* Smart: mapping editor */}
            {importMode === "smart" && llmMapping && editedMappings && (
              <div className="mt-6 space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Mapeo detectado por IA</h3>
                <p className="text-sm text-muted-foreground">{llmMapping.explanation}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 pr-4 font-medium">Columna del CSV</th>
                        <th className="py-2 pr-4 font-medium">Campo del sistema</th>
                        <th className="py-2 font-medium">Confianza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedMappings.map((m, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-mono text-xs">{m.csvColumn}</td>
                          <td className="py-2 pr-4">
                            <select
                              value={m.targetField || ""}
                              onChange={(e) => updateMapping(i, e.target.value || null)}
                              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                            >
                              <option value="">— Ignorar —</option>
                              {Object.keys(fieldLabels).map((f) => (
                                <option key={f} value={f}>
                                  {fieldLabels[f]} ({f})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2">
                            {m.targetField ? (
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColors[m.confidence]}`}>
                                {m.confidence}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Ignorada</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {llmMapping.unmappedColumns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Columnas ignoradas: {llmMapping.unmappedColumns.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <Button onClick={handleImport} disabled={importing || (importMode === "smart" && !editedMappings)}>
                {importing
                  ? "Importando..."
                  : importMode === "smart"
                    ? "Importar con mapeo inteligente"
                    : "Importar todos"}
              </Button>
              <Button variant="outline" onClick={reset}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la importación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-primary">
                ✅ {result.success} inmuebles importados correctamente
              </p>
              {result.errors > 0 && (
                <div>
                  <p className="text-destructive font-medium">
                    ❌ {result.errors} errores
                  </p>
                  <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                    {result.errorDetails.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-4">
              <Button onClick={() => router.push("/dashboard/properties")}>
                Ver inmuebles
              </Button>
              <Button variant="outline" onClick={reset}>
                Importar otro archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
