/**
 * Vapi voice provider implementation.
 */

import type { VoiceProvider, VoiceCallRequest, ParsedCallData } from "./types";

const VAPI_API = "https://api.vapi.ai";

export class VapiProvider implements VoiceProvider {
  name = "vapi";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  parseWebhook(payload: any): ParsedCallData {
    const call = payload.call || payload;
    const analysis = payload.analysis;
    const messages = payload.message || [];

    const vapiCallId = call.id || payload.id || "";
    const status = this.mapCallStatus(call.status || payload.status || "");
    const duracion = call.durationSeconds || payload.durationSeconds || 0;
    const grabacionUrl = call.recordingUrl || payload.recordingUrl || "";
    const transcripcion = call.transcript || payload.transcript || this.extractTranscript(messages);
    const resumen = analysis?.summary || call.summary || payload.summary || "";
    const coste = call.cost || payload.cost || 0;
    const startedAt = call.startedAt || payload.startedAt || null;
    const endedAt = call.endedAt || payload.endedAt || null;

    const structured = analysis?.structuredData;
    const customer = call.customer || payload.customer;
    const leadName = structured?.leadName || customer?.name || "";
    const leadPhone = structured?.leadPhone || customer?.number || payload.phoneCallProviderId || "";
    const leadEmail = structured?.leadEmail || "";
    const satisfaccion = this.extractSatisfaccion(analysis?.successEvaluation || resumen);
    const notas = structured?.notes || resumen;

    return {
      vapiCallId,
      customerPhone: leadPhone,
      duracion,
      grabacionUrl,
      transcripcion,
      resumen,
      satisfaccion,
      coste,
      estado: status,
      startedAt: startedAt ? new Date(startedAt) : null,
      endedAt: endedAt ? new Date(endedAt) : null,
      lead: {
        nombre: leadName,
        telefono: leadPhone,
        email: leadEmail,
        presupuesto: structured?.budget || null,
        urgencia: this.mapUrgencia(structured?.urgency || ""),
        notas,
      },
    };
  }

  async makeCall(params: VoiceCallRequest): Promise<any> {
    const res = await fetch(`${VAPI_API}/call`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId: params.assistantId,
        customer: { number: params.customerPhone },
        assistantOverrides: {
          variableValues: params.variableValues || {},
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Vapi API error: ${res.status} ${err}`);
    }

    return res.json();
  }

  private mapCallStatus(status: string): string {
    const s = status.toLowerCase();
    if (s === "completed" || s === "ended") return "completada";
    if (s === "failed" || s === "error") return "fallida";
    if (s === "no-answer" || s === "no_answer") return "no_contesta";
    if (s === "busy") return "ocupado";
    return "completada";
  }

  private mapUrgencia(urgency: string): string {
    const u = urgency.toLowerCase();
    if (u.includes("inmediata") || u.includes("urgent") || u === "inmediata") return "inmediata";
    if (u.includes("primer") || u.includes("month") || u === "primer_mes") return "primer_mes";
    return "sin_urgencia";
  }

  private extractSatisfaccion(text: string): string | null {
    if (!text) return null;
    const t = text.toLowerCase();
    if (t.includes("frustrado") || t.includes("angry") || t.includes("negative")) return "frustrado";
    if (t.includes("indiferente") || t.includes("neutral")) return "indiferente";
    if (t.includes("bien") || t.includes("good") || t.includes("positive") || t.includes("satisfecho")) return "bien";
    if (t.includes("rechazo") || t.includes("rejection")) return "rechazo_ia";
    return "indiferente";
  }

  private extractTranscript(messages: { role?: string; content?: string }[]): string {
    if (!messages || messages.length === 0) return "";
    return messages
      .filter((m) => m.role && m.content)
      .map((m) => `${m.role === "assistant" ? "AI" : "Usuario"}: ${m.content}`)
      .join("\n");
  }
}
