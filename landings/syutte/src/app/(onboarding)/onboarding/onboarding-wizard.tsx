"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { completeOnboarding } from "@/lib/actions/onboarding";

const tones = [
  { value: "profesional", label: "Profesional", desc: "Serio y formal" },
  { value: "cercano", label: "Cercano", desc: "Amable y accesible" },
  { value: "entusiasta", label: "Entusiasta", desc: "Enérgico y motivador" },
];

const propertyTypeOptions = [
  { value: "PISO", label: "Pisos" },
  { value: "CASA", label: "Casas" },
  { value: "LOCAL", label: "Locales" },
  { value: "OFICINA", label: "Oficinas" },
  { value: "TERRENO", label: "Terrenos" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    businessPhone: "",
    assistantTone: "profesional",
    greetingMessage: "",
    propertyTypes: [] as string[],
  });

  function togglePropertyType(value: string) {
    setForm((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(value)
        ? prev.propertyTypes.filter((t) => t !== value)
        : [...prev.propertyTypes, value],
    }));
  }

  async function handleComplete() {
    setSaving(true);
    try {
      await completeOnboarding(form);
      router.push("/dashboard");
      router.refresh();
    } catch {
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  const canContinue = () => {
    switch (step) {
      case 0: return form.businessName.trim().length > 0 && form.businessPhone.trim().length > 0;
      case 1: return form.greetingMessage.trim().length > 0;
      case 2: return form.propertyTypes.length > 0;
      default: return true;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {["Negocio", "Asistente", "Propiedades"].map((label, i) => (
              <button
                key={label}
                onClick={() => i < step && setStep(i)}
                className={`text-sm font-medium ${
                  i <= step ? "text-primary" : "text-muted-foreground"
                } ${i < step ? "cursor-pointer hover:underline" : "cursor-default"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 0: Business Info */}
        {step === 0 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xl font-bold text-primary-foreground">S</span>
                </div>
                <h1 className="text-2xl font-bold">Configura tu agencia</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Cuéntanos sobre tu negocio inmobiliario
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Nombre de la agencia</label>
                <Input
                  placeholder="Ej: Inmobiliaria Centro"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Teléfono de contacto</label>
                <Input
                  placeholder="Ej: +34 912 345 678"
                  value={form.businessPhone}
                  onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                />
              </div>

              <Button className="w-full mt-2" onClick={() => setStep(1)} disabled={!canContinue()}>
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: AI Assistant */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Asistente virtual</h2>
                <p className="text-sm text-muted-foreground">
                  Personaliza cómo se presenta tu asistente IA
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Tono del asistente</label>
                <div className="grid gap-2">
                  {tones.map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        form.assistantTone === tone.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => setForm({ ...form, assistantTone: tone.value })}
                    >
                      <span className="font-medium">{tone.label}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{tone.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Saludo inicial</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={3}
                  placeholder="Ej: Hola, gracias por llamar a [agencia]. ¿En qué puedo ayudarle?"
                  value={form.greetingMessage}
                  onChange={(e) => setForm({ ...form, greetingMessage: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                  Atrás
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)} disabled={!canContinue()}>
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Property Types */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Tipo de propiedades</h2>
                <p className="text-sm text-muted-foreground">
                  ¿Con qué tipo de inmuebles trabajas?
                </p>
              </div>

              <div className="grid gap-2">
                {propertyTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      form.propertyTypes.includes(opt.value)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => togglePropertyType(opt.value)}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {form.propertyTypes.includes(opt.value) && (
                      <span className="float-right text-primary">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Atrás
                </Button>
                <Button className="flex-1" onClick={handleComplete} disabled={!canContinue() || saving}>
                  {saving ? "Guardando..." : "Completar configuración"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip option */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <button
            onClick={handleComplete}
            className="hover:underline"
          >
            Saltar configuración, ir al panel
          </button>
        </p>
      </div>
    </div>
  );
}
