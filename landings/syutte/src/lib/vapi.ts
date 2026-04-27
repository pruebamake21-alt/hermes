/**
 * @deprecated Use lib/voice-provider instead.
 * Re-exports for backward compatibility.
 */

import { getVoiceProvider, parseVoiceWebhook, makeVoiceCall } from "./voice-provider";

export const parseVapiWebhook = parseVoiceWebhook;
export const makeVapiCall = makeVoiceCall;
export { getVoiceProvider };
