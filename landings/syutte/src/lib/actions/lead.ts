"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/data";

export async function updateLeadStatus(id: string, estado: string) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  await prisma.lead.updateMany({
    where: { id, tenantId: user.tenantId },
    data: { estado: estado as any, ultimoContacto: new Date() },
  });

  revalidatePath("/dashboard/leads");
}

export async function updateLeadNotes(id: string, notasAgente: string) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  await prisma.lead.updateMany({
    where: { id, tenantId: user.tenantId },
    data: { notasAgente },
  });

  revalidatePath("/dashboard/leads");
}
