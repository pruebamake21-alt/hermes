/**
 * Central typed accessor for agent configuration stored in Tenant.config JSON.
 * All agent settings live here — no schema migrations needed.
 */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/data";

// ── Types ──────────────────────────────────────────────

export interface BusinessHour {
  day: number; // 0=Sun .. 6=Sat
  enabled: boolean;
  open: string; // "09:00"
  close: string; // "18:00"
}

export interface EscalationConfig {
  mode: "manual" | "time" | "intent" | "hours";
  timeoutMinutes?: number;
  escalateIntents?: string[];
  fallbackMessage?: string;
  notifyEmail?: string;
  notifyPhone?: string;
}

export interface FullAgentConfig {
  // Existing fields (preserved)
  businessName?: string;
  businessPhone?: string;
  assistantLanguage?: string;
  assistantTone?: string;
  greetingMessage?: string;
  propertyTypes?: string[];
  systemPrompt?: string;
  variables?: Record<string, string>;

  // New agent controls
  llmApiKey?: string;
  allowScheduling: boolean;
  voiceAgentEnabled: boolean;
  textAgentEnabled: boolean;
  businessHours: BusinessHour[];
  escalation: EscalationConfig;
}

// ── Defaults ───────────────────────────────────────────

const DEFAULT_BUSINESS_HOURS: BusinessHour[] = [
  { day: 1, enabled: true, open: "09:00", close: "18:00" },
  { day: 2, enabled: true, open: "09:00", close: "18:00" },
  { day: 3, enabled: true, open: "09:00", close: "18:00" },
  { day: 4, enabled: true, open: "09:00", close: "18:00" },
  { day: 5, enabled: true, open: "09:00", close: "18:00" },
  { day: 6, enabled: false, open: "10:00", close: "14:00" },
  { day: 0, enabled: false, open: "00:00", close: "00:00" },
];

export function getDefaultAgentConfig(): FullAgentConfig {
  return {
    allowScheduling: false,
    voiceAgentEnabled: true,
    textAgentEnabled: true,
    businessHours: DEFAULT_BUSINESS_HOURS,
    escalation: {
      mode: "manual",
      timeoutMinutes: 10,
      escalateIntents: ["hablar_con_humano"],
      fallbackMessage: "Un agente se pondrá en contacto contigo pronto.",
    },
  };
}

// ── Read ───────────────────────────────────────────────

export async function getAgentConfig(tenantId?: string): Promise<FullAgentConfig> {
  if (!tenantId) {
    const user = await getCurrentUser();
    tenantId = user?.tenantId;
  }
  if (!tenantId) return getDefaultAgentConfig();
  if (process.env.DEMO_MODE === "true" && !process.env.DATABASE_URL) return getDefaultAgentConfig();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { config: true },
  });

  const stored = (tenant?.config as Record<string, any>) || {};
  return { ...getDefaultAgentConfig(), ...stored };
}

// ── Write ──────────────────────────────────────────────

export async function updateAgentConfig(
  partial: Partial<FullAgentConfig>,
  tenantId?: string
): Promise<void> {
  if (!tenantId) {
    const user = await getCurrentUser();
    tenantId = user?.tenantId;
  }
  if (!tenantId) throw new Error("No tenant ID");

  const current = await getAgentConfig(tenantId);
  const merged = { ...current, ...partial };

  // Remove explicit undefined so we don't overwrite with null
  for (const [key, value] of Object.entries(partial)) {
    if (value === undefined) delete (merged as any)[key];
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { config: merged as any },
  });
}

// ── Helpers ────────────────────────────────────────────

export function isWithinBusinessHours(businessHours: BusinessHour[]): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const today = businessHours.find((bh) => bh.day === dayOfWeek);
  if (!today || !today.enabled) return false;

  return currentTime >= today.open && currentTime <= today.close;
}

export function isVoiceAgentActive(config: FullAgentConfig): boolean {
  if (!config.voiceAgentEnabled) return false;
  return isWithinBusinessHours(config.businessHours);
}
