"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export async function createProperty(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  const raw = Object.fromEntries(formData);

  const data = {
    tenantId: user.tenantId,
    userId: user.id,
    operationType: raw.operationType as any,
    propertyType: raw.propertyType as any,
    price: parseFloat(raw.price as string),
    currency: (raw.currency as string) || "EUR",
    status: (raw.status as any) || "DISPONIBLE",
    title: raw.title as string,
    description: raw.description as string,
    city: raw.city as string,
    usableSurface: raw.usableSurface ? parseFloat(raw.usableSurface as string) : null,
    builtSurface: raw.builtSurface ? parseFloat(raw.builtSurface as string) : null,
    bedrooms: raw.bedrooms ? parseInt(raw.bedrooms as string) : null,
    bathrooms: raw.bathrooms ? parseInt(raw.bathrooms as string) : null,
    toilets: raw.toilets ? parseInt(raw.toilets as string) : null,
    floor: raw.floor as string,
    hasElevator: raw.hasElevator === "on",
    terrace: raw.terrace === "on",
    balcony: raw.balcony === "on",
    garage: raw.garage === "on",
    storageRoom: raw.storageRoom === "on",
    pool: raw.pool === "on",
    airConditioning: raw.airConditioning === "on",
    heating: raw.heating === "on",
    energyCert: raw.energyCert as any || null,
    address: raw.address as string,
    latitude: raw.latitude ? parseFloat(raw.latitude as string) : null,
    longitude: raw.longitude ? parseFloat(raw.longitude as string) : null,
    zone: raw.zone as string,
    hideExactAddress: raw.hideExactAddress === "on",
  };

  await prisma.property.create({ data } as any);

  revalidatePath("/dashboard/properties");
}

export async function updateProperty(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  const raw = Object.fromEntries(formData);

  const data = {
    operationType: raw.operationType as any,
    propertyType: raw.propertyType as any,
    price: parseFloat(raw.price as string),
    currency: (raw.currency as string) || "EUR",
    status: (raw.status as any) || "DISPONIBLE",
    title: raw.title as string,
    description: raw.description as string,
    city: raw.city as string,
    usableSurface: raw.usableSurface ? parseFloat(raw.usableSurface as string) : null,
    builtSurface: raw.builtSurface ? parseFloat(raw.builtSurface as string) : null,
    bedrooms: raw.bedrooms ? parseInt(raw.bedrooms as string) : null,
    bathrooms: raw.bathrooms ? parseInt(raw.bathrooms as string) : null,
    toilets: raw.toilets ? parseInt(raw.toilets as string) : null,
    floor: raw.floor as string,
    hasElevator: raw.hasElevator === "on",
    terrace: raw.terrace === "on",
    balcony: raw.balcony === "on",
    garage: raw.garage === "on",
    storageRoom: raw.storageRoom === "on",
    pool: raw.pool === "on",
    airConditioning: raw.airConditioning === "on",
    heating: raw.heating === "on",
    energyCert: raw.energyCert as any || null,
    address: raw.address as string,
    latitude: raw.latitude ? parseFloat(raw.latitude as string) : null,
    longitude: raw.longitude ? parseFloat(raw.longitude as string) : null,
    zone: raw.zone as string,
    hideExactAddress: raw.hideExactAddress === "on",
  };

  await prisma.property.updateMany({
    where: { id, tenantId: user.tenantId },
    data,
  });

  revalidatePath("/dashboard/properties");
}

export async function deleteProperty(id: string) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  await prisma.property.deleteMany({
    where: { id, tenantId: user.tenantId },
  });

  revalidatePath("/dashboard/properties");
}
