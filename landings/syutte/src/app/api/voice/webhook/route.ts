import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseVoiceWebhook } from "@/lib/voice-provider";
import { isWithinBusinessHours } from "@/lib/tenant-config";

/**
 * POST /api/voice/webhook
 * Generic webhook for voice AI providers (Vapi, Twilio, etc).
 * Auto-creates or updates leads and creates call records.
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = parseVoiceWebhook(payload);

    if (!parsed.vapiCallId) {
      return NextResponse.json({ ok: false, error: "Invalid payload: no call ID" }, { status: 400 });
    }

    // Idempotency: skip if call already exists
    const existing = parsed.vapiCallId ? await prisma.call.findFirst({
      where: { vapiCallId: parsed.vapiCallId },
    }) : null;

    if (existing) {
      return NextResponse.json({ ok: true, existing: true });
    }

    // Determine tenant from assistant ID and fetch config
    const assistantId = payload.assistantId || payload.call?.assistantId;
    let tenantId: string | null = null;

    if (assistantId) {
      const tenant = await prisma.tenant.findFirst({
        where: { vapiAssistantId: assistantId },
        select: { id: true, config: true },
      });
      tenantId = tenant?.id || null;

      // ── Agent guard ──────────────────────────────────
      if (tenant?.config) {
        const cfg = (tenant.config as Record<string, any>) || {};

        // Check if voice agent is enabled
        if (cfg.voiceAgentEnabled === false) {
          console.log(`[Webhook] Voice agent disabled for tenant ${tenantId}`);
          return NextResponse.json({ ok: false, blocked: true, reason: "voice_disabled" });
        }

        // Check business hours
        const businessHours = cfg.businessHours;
        if (businessHours && Array.isArray(businessHours) && businessHours.length > 0) {
          if (!isWithinBusinessHours(businessHours)) {
            console.log(`[Webhook] Outside business hours for tenant ${tenantId}`);
            // Call is still processed but flagged
          }
        }
      }
    }

    // Fallback: first tenant (for demo mode)
    if (!tenantId) {
      const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
      tenantId = firstTenant?.id || null;
    }

    if (!tenantId) {
      return NextResponse.json({ ok: false, error: "No tenant found" }, { status: 404 });
    }

    // Find or create lead by phone number
    let leadId: string | null = null;
    if (parsed.lead?.telefono) {
      const existingLead = await prisma.lead.findFirst({
        where: { telefono: parsed.lead.telefono, tenantId },
      });

      if (existingLead) {
        leadId = existingLead.id;
        await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            nombre: parsed.lead.nombre || existingLead.nombre,
            email: parsed.lead.email || existingLead.email,
            presupuesto: parsed.lead.presupuesto || existingLead.presupuesto,
            urgencia: parsed.lead.urgencia as any || existingLead.urgencia,
            notas: parsed.lead.notas ? `${existingLead.notas}\n---\n${parsed.lead.notas}` : existingLead.notas,
            ultimoContacto: new Date(),
          },
        });
      } else if (parsed.lead.nombre) {
        const newLead = await prisma.lead.create({
          data: {
            tenantId,
            nombre: parsed.lead.nombre,
            telefono: parsed.lead.telefono,
            email: parsed.lead.email || null,
            presupuesto: parsed.lead.presupuesto || null,
            urgencia: (parsed.lead.urgencia as any) || "sin_urgencia",
            canal: "llamada_telefonica",
            notas: parsed.lead.notas || null,
            ultimoContacto: new Date(),
          },
        });
        leadId = newLead.id;
      }
    }

    // Create call record
    await prisma.call.create({
      data: {
        tenantId,
        leadId,
        vapiCallId: parsed.vapiCallId,
        customerPhone: parsed.customerPhone,
        duracion: parsed.duracion,
        grabacionUrl: parsed.grabacionUrl,
        transcripcion: parsed.transcripcion,
        resumen: parsed.resumen,
        satisfaccion: parsed.satisfaccion as any,
        coste: parsed.coste,
        estado: parsed.estado as any,
        startedAt: parsed.startedAt,
        endedAt: parsed.endedAt,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Voice webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
