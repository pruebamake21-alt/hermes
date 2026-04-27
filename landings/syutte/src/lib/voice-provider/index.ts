/**
 * Voice provider factory.
 * Select the active provider via the VOICE_PROVIDER env var.
 *
 *   VOICE_PROVIDER=vapi    (default)
 *   VOICE_PROVIDER=twilio  (future)
 */

import type { VoiceProvider } from "./types";
import { VapiProvider } from "./vapi";

const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY || "";

let _instance: VoiceProvider | null = null;

export function getVoiceProvider(): VoiceProvider {
  if (_instance) return _instance;

  const provider = process.env.VOICE_PROVIDER || "vapi";

  switch (provider) {
    case "vapi":
    default:
      _instance = new VapiProvider(VAPI_PRIVATE_KEY);
      break;
  }

  return _instance;
}

/** Convenience: parse a webhook payload using the active provider */
export function parseVoiceWebhook(payload: any) {
  return getVoiceProvider().parseWebhook(payload);
}

/** Convenience: make an outbound call using the active provider */
export function makeVoiceCall(params: { assistantId: string; customerPhone: string; variableValues?: Record<string, string> }) {
  return getVoiceProvider().makeCall(params);
}
