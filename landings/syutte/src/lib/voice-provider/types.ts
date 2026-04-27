/**
 * Voice provider abstraction layer.
 * Implement this interface to add a new voice AI provider.
 * Select the active provider via VOICE_PROVIDER env var.
 */

export interface VoiceCallRequest {
  assistantId: string;
  customerPhone: string;
  variableValues?: Record<string, string>;
}

export interface ParsedCallData {
  vapiCallId: string;
  customerPhone: string;
  duracion: number;
  grabacionUrl: string;
  transcripcion: string;
  resumen: string;
  satisfaccion: string | null;
  coste: number;
  estado: string;
  startedAt: Date | null;
  endedAt: Date | null;
  lead: {
    nombre: string;
    telefono: string;
    email: string;
    presupuesto: number | null;
    urgencia: string;
    notas: string;
  };
}

export interface VoiceProvider {
  /** Name of the provider (e.g. "vapi", "twilio") */
  name: string;

  /** Parse an incoming webhook payload into normalized call data */
  parseWebhook(payload: any): ParsedCallData;

  /** Initiate an outbound call */
  makeCall(params: VoiceCallRequest): Promise<any>;
}
