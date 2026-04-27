"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { saveAgentConfig } from "@/lib/actions/settings";
import type { FullAgentConfig, BusinessHour, EscalationConfig } from "@/lib/tenant-config";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function SettingsClient({ config }: { config: FullAgentConfig }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Local state for toggles (instant UI feedback before form submit)
  const [voiceEnabled, setVoiceEnabled] = useState(config.voiceAgentEnabled);
  const [textEnabled, setTextEnabled] = useState(config.textAgentEnabled);
  const [schedulingEnabled, setSchedulingEnabled] = useState(config.allowScheduling);
  const [hours, setHours] = useState<BusinessHour[]>(config.businessHours);
  const [escalation, setEscalation] = useState<EscalationConfig>(config.escalation);
  const [llmKey, setLlmKey] = useState(config.llmApiKey || "");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      await saveAgentConfig(fd);
      toast.success("Configuración guardada correctamente");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function toggleHourDay(day: number) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, enabled: !h.enabled } : h)));
  }

  function updateHour(day: number, field: "open" | "close", value: string) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu cuenta y agentes</p>
      </div>

      {/* ── Agentes ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Agentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Voice toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Agente de Voz</p>
              <p className="text-sm text-muted-foreground">Atiende llamadas entrantes automáticamente</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="voiceAgentEnabled"
                className="peer sr-only"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Text toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Agente de Texto</p>
              <p className="text-sm text-muted-foreground">Responde consultas por chat y WhatsApp</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="textAgentEnabled"
                className="peer sr-only"
                checked={textEnabled}
                onChange={(e) => setTextEnabled(e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Scheduling toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Permitir agendar citas</p>
              <p className="text-sm text-muted-foreground">
                El agente puede programar visitas a inmuebles en el calendario
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="allowScheduling"
                className="peer sr-only"
                checked={schedulingEnabled}
                onChange={(e) => setSchedulingEnabled(e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* ── Horario ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Horario de atención</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hours.map((h) => (
              <div key={h.day} className="flex items-center gap-4 rounded-lg border px-4 py-3">
                <label className="flex w-28 items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name={`hours-${h.day}-enabled`}
                    checked={h.enabled}
                    onChange={() => toggleHourDay(h.day)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {DAY_NAMES[h.day]}
                </label>
                <input
                  type="time"
                  name={`hours-${h.day}-open`}
                  value={h.open}
                  onChange={(e) => updateHour(h.day, "open", e.target.value)}
                  disabled={!h.enabled}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm disabled:opacity-40"
                />
                <span className="text-sm text-muted-foreground">a</span>
                <input
                  type="time"
                  name={`hours-${h.day}-close`}
                  value={h.close}
                  onChange={(e) => updateHour(h.day, "close", e.target.value)}
                  disabled={!h.enabled}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm disabled:opacity-40"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Escalado a humano ──────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Escalado a humano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="escalation-mode">Modo de escalado</Label>
            <select
              id="escalation-mode"
              name="escalation-mode"
              value={escalation.mode}
              onChange={(e) => setEscalation({ ...escalation, mode: e.target.value as any })}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="manual">Manual — solo cuando un agente humano lo decida</option>
              <option value="time">Por tiempo — si la llamada dura más de X minutos</option>
              <option value="intent">Por intención — si el lead pide hablar con humano</option>
              <option value="hours">Fuera de horario — cuando el agente no está activo</option>
            </select>
          </div>

          {escalation.mode === "time" && (
            <div>
              <Label htmlFor="escalation-timeout">Minutos antes de escalar</Label>
              <Input
                id="escalation-timeout"
                name="escalation-timeout"
                type="number"
                min={1}
                max={120}
                value={escalation.timeoutMinutes || 10}
                onChange={(e) => setEscalation({ ...escalation, timeoutMinutes: parseInt(e.target.value) || 10 })}
              />
            </div>
          )}

          {escalation.mode === "intent" && (
            <div>
              <Label htmlFor="escalation-intents">
                Intenciones para escalar (separadas por coma)
              </Label>
              <Input
                id="escalation-intents"
                name="escalation-intents"
                placeholder="hablar_con_humano, queja, reclamación"
                value={(escalation.escalateIntents || []).join(", ")}
                onChange={(e) =>
                  setEscalation({
                    ...escalation,
                    escalateIntents: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          )}

          <div>
            <Label htmlFor="escalation-message">Mensaje de derivación</Label>
            <textarea
              id="escalation-message"
              name="escalation-message"
              rows={3}
              value={escalation.fallbackMessage || ""}
              onChange={(e) => setEscalation({ ...escalation, fallbackMessage: e.target.value })}
              placeholder="Un agente se pondrá en contacto contigo pronto."
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="escalation-email">Email de notificación</Label>
              <Input
                id="escalation-email"
                name="escalation-email"
                type="email"
                placeholder="agente@inmobiliaria.es"
                value={escalation.notifyEmail || ""}
                onChange={(e) => setEscalation({ ...escalation, notifyEmail: e.target.value || undefined })}
              />
            </div>
            <div>
              <Label htmlFor="escalation-phone">Teléfono de notificación</Label>
              <Input
                id="escalation-phone"
                name="escalation-phone"
                placeholder="+34 600 000 000"
                value={escalation.notifyPhone || ""}
                onChange={(e) => setEscalation({ ...escalation, notifyPhone: e.target.value || undefined })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── LLM ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Importación Inteligente (IA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="llmApiKey">API Key de OpenAI (o compatible)</Label>
            <Input
              id="llmApiKey"
              name="llmApiKey"
              type="password"
              placeholder="sk-..."
              value={llmKey}
              onChange={(e) => setLlmKey(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Se usa para auto-detectar columnas en importación CSV. Si se deja vacío, se usará la
              variable de entorno <code>LLM_API_KEY</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving}>
        {saving ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  );
}
