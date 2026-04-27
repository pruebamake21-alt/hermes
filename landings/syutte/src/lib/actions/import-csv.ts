"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/data";
import { columnMapping, mapValue } from "@/lib/csv-utils";

export { mapValue };

export async function importProperties(rawData: any[], userId: string) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  const results = { success: 0, errors: 0, errorDetails: [] as string[] };

  for (const row of rawData) {
    try {
      const data: any = { tenantId: user.tenantId, userId };

      for (const [csvCol, value] of Object.entries(row)) {
        const field = columnMapping[csvCol.trim().toLowerCase()];
        if (!field || !value) continue;
        (data as any)[field] = mapValue(field, value as string);
      }

      // Ensure required fields
      if (!data.operationType) data.operationType = "VENTA";
      if (!data.propertyType) data.propertyType = "PISO";
      if (data.price === null || data.price === undefined) {
        results.errors++;
        results.errorDetails.push(`Fila ${results.success + results.errors}: precio requerido`);
        continue;
      }
      if (!data.currency) data.currency = "EUR";
      if (!data.status) data.status = "DISPONIBLE";

      await prisma.property.create({ data });
      results.success++;
    } catch (error: any) {
      results.errors++;
      results.errorDetails.push(`Fila ${results.success + results.errors}: ${error.message}`);
    }
  }

  revalidatePath("/dashboard/properties");
  return results;
}
