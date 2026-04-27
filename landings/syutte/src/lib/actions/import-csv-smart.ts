"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/data";
import { smartMapColumns } from "@/lib/llm/smart-column-mapper";
import { getAgentConfig } from "@/lib/tenant-config";
import { mapValue } from "@/lib/csv-utils";

export async function detectColumnsWithLLM(
  csvHeaders: string[],
  sampleRows: Record<string, string>[]
) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  const config = await getAgentConfig(user.tenantId);
  const apiKey = config.llmApiKey || process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No hay clave de API de IA configurada. Configúrala en Ajustes > Importación Inteligente."
    );
  }

  return smartMapColumns(csvHeaders, sampleRows, {
    apiKey,
    baseUrl: process.env.LLM_API_URL || "https://api.openai.com/v1",
    model: process.env.LLM_MODEL || "gpt-4o-mini",
  });
}

export async function importPropertiesSmart(
  rawData: any[],
  mappings: { csvColumn: string; targetField: string | null }[],
  userId: string
) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  const results = { success: 0, errors: 0, errorDetails: [] as string[] };

  // Build lookup: lowercase csvColumn -> targetField
  const mappingLookup = new Map<string, string>();
  for (const m of mappings) {
    if (m.targetField) {
      mappingLookup.set(m.csvColumn.toLowerCase(), m.targetField);
    }
  }

  for (const row of rawData) {
    try {
      const data: any = { tenantId: user.tenantId, userId };

      for (const [csvCol, value] of Object.entries(row)) {
        const field = mappingLookup.get(csvCol.toLowerCase());
        if (!field || !value) continue;
        data[field] = mapValue(field, value as string);
      }

      // Defaults for required fields
      if (!data.operationType) data.operationType = "VENTA";
      if (!data.propertyType) data.propertyType = "PISO";
      if (data.price === null || data.price === undefined) {
        results.errors++;
        results.errorDetails.push(
          `Fila ${results.success + results.errors + 1}: precio requerido`
        );
        continue;
      }
      if (!data.currency) data.currency = "EUR";
      if (!data.status) data.status = "DISPONIBLE";

      await prisma.property.create({ data });
      results.success++;
    } catch (error: any) {
      results.errors++;
      results.errorDetails.push(
        `Fila ${results.success + results.errors}: ${error.message}`
      );
    }
  }

  revalidatePath("/dashboard/properties");
  return results;
}
