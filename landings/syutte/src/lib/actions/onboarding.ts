"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/data";

export async function completeOnboarding(config: {
  businessName: string;
  businessPhone: string;
  assistantTone: string;
  greetingMessage: string;
  propertyTypes: string[];
}) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  await prisma.tenant.upsert({
    where: { id: user.tenantId },
    update: {
      onboardingCompleted: true,
      name: config.businessName,
      config: {
        businessName: config.businessName,
        businessPhone: config.businessPhone,
        assistantLanguage: "es",
        assistantTone: config.assistantTone,
        greetingMessage: config.greetingMessage,
        propertyTypes: config.propertyTypes,
      },
    },
    create: {
      id: user.tenantId,
      slug: `tenant-${user.tenantId.slice(0, 6)}`,
      name: config.businessName,
      onboardingCompleted: true,
      config: {
        businessName: config.businessName,
        businessPhone: config.businessPhone,
        assistantLanguage: "es",
        assistantTone: config.assistantTone,
        greetingMessage: config.greetingMessage,
        propertyTypes: config.propertyTypes,
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getOnboardingStatus(): Promise<{ completed: boolean; config?: any }> {
  const user = await getCurrentUser();
  if (!user?.tenantId) return { completed: false };

  if (process.env.DEMO_MODE === "true") {
    return { completed: true };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { onboardingCompleted: true, config: true },
  });

  if (!tenant) return { completed: false };

  return {
    completed: tenant.onboardingCompleted,
    config: tenant.config,
  };
}
