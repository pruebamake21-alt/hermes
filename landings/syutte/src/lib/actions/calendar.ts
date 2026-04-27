"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/data";

export async function createAppointment(data: {
  leadId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  updateLeadStatus?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: user.tenantId,
      leadId: data.leadId || null,
      title: data.title,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdBy: "manual",
    },
  });

  // Optionally update the linked lead to Visita_programada
  if (data.updateLeadStatus && data.leadId) {
    await prisma.lead.updateMany({
      where: { id: data.leadId, tenantId: user.tenantId },
      data: { estado: "Visita_programada", ultimoContacto: new Date(data.startDate) },
    });
  }

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/leads");
  return { success: true, id: appointment.id };
}

export async function updateAppointment(
  id: string,
  data: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }
) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  await prisma.appointment.updateMany({
    where: { id, tenantId: user.tenantId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.status && { status: data.status }),
    },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function deleteAppointment(id: string) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  await prisma.appointment.deleteMany({
    where: { id, tenantId: user.tenantId },
  });

  revalidatePath("/dashboard/calendar");
  return { success: true };
}

export async function rescheduleAppointment(id: string, startDate: string, endDate: string) {
  return updateAppointment(id, { startDate, endDate });
}
