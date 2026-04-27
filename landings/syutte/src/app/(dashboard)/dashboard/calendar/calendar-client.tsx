"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/actions/calendar";

// Spanish locale for FullCalendar
const esLocale = {
  code: "es",
  week: { dow: 1, doy: 4 },
  buttonText: {
    prev: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
  },
  moreLinkText: (n: number) => `+${n} más`,
  noEventsText: "No hay visitas programadas",
};

interface AppointmentEvent {
  id: string;
  title: string;
  leadId: string | null;
  leadName: string | null;
  leadPhone: string | null;
  propertyId: string | null;
  propertyTitle: string | null;
  notes: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string | null;
}

export function CalendarClient({
  initialAppointments,
  tenantId,
}: {
  initialAppointments: AppointmentEvent[];
  tenantId: string;
}) {
  const router = useRouter();
  const [events, setEvents] = useState<AppointmentEvent[]>(initialAppointments);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // New appointment form
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newDuration, setNewDuration] = useState(60);

  function handleEventClick(info: any) {
    const event = events.find((e) => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setShowModal(true);
    }
  }

  async function handleEventDrop(info: any) {
    const event = events.find((e) => e.id === info.event.id);
    if (!event) return;

    const start = info.event.start?.toISOString();
    const end = info.event.end?.toISOString();
    if (!start || !end) return;

    try {
      await updateAppointment(event.id, { startDate: start, endDate: end });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, startDate: start, endDate: end } : e
        )
      );
      toast.success("Visita reprogramada");
    } catch {
      toast.error("Error al reprogramar");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!selectedEvent) return;
    try {
      await deleteAppointment(selectedEvent.id);
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setShowModal(false);
      toast.success("Visita eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  async function handleCreate() {
    if (!newTitle || !newDate) {
      toast.error("Completa el título y la fecha");
      return;
    }
    try {
      const start = `${newDate}T${newTime}:00`;
      const endDate = new Date(new Date(start).getTime() + newDuration * 60000);
      const res = await createAppointment({
        title: newTitle,
        startDate: start,
        endDate: endDate.toISOString(),
      });
      // Add to local state
      setEvents((prev) => [
        ...prev,
        {
          id: res.id,
          title: newTitle,
          leadId: null,
          leadName: null,
          leadPhone: null,
          propertyId: null,
          propertyTitle: null,
          notes: "",
          startDate: start,
          endDate: endDate.toISOString(),
          status: "scheduled",
          createdBy: "manual",
        },
      ]);
      setShowNewModal(false);
      setNewTitle("");
      setNewDate("");
      setNewTime("10:00");
      toast.success("Visita creada");
    } catch {
      toast.error("Error al crear la visita");
    }
  }

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startDate,
    end: e.endDate,
    backgroundColor:
      e.status === "cancelled"
        ? "#ef4444"
        : e.createdBy === "agent"
          ? "#8b5cf6"
          : "#3b82f6",
    borderColor: "transparent",
    textColor: "#fff",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">Gestiona las visitas programadas a inmuebles</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>+ Nueva visita</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable={true}
            height="auto"
          />
        </CardContent>
      </Card>

      {/* Event detail modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
            <div className="mt-4 space-y-2 text-sm">
              {selectedEvent.leadName && (
                <p><span className="text-muted-foreground">Contacto:</span> {selectedEvent.leadName} ({selectedEvent.leadPhone})</p>
              )}
              {selectedEvent.propertyTitle && (
                <p><span className="text-muted-foreground">Inmueble:</span> {selectedEvent.propertyTitle}</p>
              )}
              <p><span className="text-muted-foreground">Fecha:</span> {new Date(selectedEvent.startDate).toLocaleString("es-ES")}</p>
              {selectedEvent.notes && (
                <p><span className="text-muted-foreground">Notas:</span> {selectedEvent.notes}</p>
              )}
              <p>
                <span className="text-muted-foreground">Estado:</span>{" "}
                {selectedEvent.status === "scheduled" ? "Programada" : selectedEvent.status}
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Cancelar visita
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New appointment modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNewModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">Nueva visita</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="new-title">Título</Label>
                <Input id="new-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Visita: Nombre del cliente" />
              </div>
              <div>
                <Label htmlFor="new-date">Fecha</Label>
                <Input id="new-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new-time">Hora</Label>
                <Input id="new-time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new-duration">Duración (minutos)</Label>
                <Input id="new-duration" type="number" value={newDuration} onChange={(e) => setNewDuration(parseInt(e.target.value) || 60)} min={15} step={15} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleCreate}>Crear visita</Button>
              <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
