import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseVapiWebhook } from "@/lib/vapi";

/**
 * POST /api/vapi/webhook
 * Receives call completion events from Vapi.
 * Auto-creates or updates leads and creates call records.
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Parse the Vapi webhook payload
    const parsed = parseVapiWebhook(payload);

    if (!parsed.vapiCallId) {
      return NextResponse.json({ ok: false, error: "Invalid payload: no call ID" }, { status: 400 });
    }

    // Check if call already exists (idempotency)
    const existing = parsed.vapiCallId ? await prisma.call.findFirst({
      where: { vapiCallId: parsed.vapiCallId },
    }) : null;

    if (existing) {
      return NextResponse.json({ ok: true, existing: true });
    }

    // Determine tenant from assistant ID or variables
    // Vapi sends assistantId in the payload — we map it to a tenant via their config
    const assistantId = payload.assistantId || payload.call?.assistantId;
    let tenantId: string | null = null;

    if (assistantId) {
      const tenant = await prisma.tenant.findFirst({
        where: { vapiAssistantId: assistantId },
        select: { id: true },
      });
      tenantId = tenant?.id || null;
    }

    // If no tenant found via assistantId, use the first tenant (demo mode fallback)
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
        // Update lead with new info
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
        // Only create lead if we have at least a name
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
    console.error("Vapi webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
