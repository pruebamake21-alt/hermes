"use server";

import { revalidatePath } from "next/cache";
import { updateAgentConfig } from "@/lib/tenant-config";
import { getCurrentUser } from "@/lib/data";

export async function saveAgentConfig(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.tenantId) throw new Error("No tenant");

  const config: Record<string, any> = {
    allowScheduling: formData.get("allowScheduling") === "on",
    voiceAgentEnabled: formData.get("voiceAgentEnabled") === "on",
    textAgentEnabled: formData.get("textAgentEnabled") === "on",
    llmApiKey: (formData.get("llmApiKey") as string) || undefined,
  };

  // Parse business hours
  const businessHours = [];
  for (let d = 0; d <= 6; d++) {
    businessHours.push({
      day: d,
      enabled: formData.get(`hours-${d}-enabled`) === "on",
      open: (formData.get(`hours-${d}-open`) as string) || "09:00",
      close: (formData.get(`hours-${d}-close`) as string) || "18:00",
    });
  }
  config.businessHours = businessHours;

  // Parse escalation
  config.escalation = {
    mode: (formData.get("escalation-mode") as string) || "manual",
    timeoutMinutes: parseInt(formData.get("escalation-timeout") as string) || 10,
    escalateIntents: ((formData.get("escalation-intents") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    fallbackMessage: (formData.get("escalation-message") as string) || "",
    notifyEmail: (formData.get("escalation-email") as string) || undefined,
    notifyPhone: (formData.get("escalation-phone") as string) || undefined,
  };

  // If LLM key is empty string, remove it (use env var instead)
  if (config.llmApiKey === "") delete config.llmApiKey;

  await updateAgentConfig(config as any, user.tenantId);
  revalidatePath("/dashboard/settings");

  return { success: true };
}
