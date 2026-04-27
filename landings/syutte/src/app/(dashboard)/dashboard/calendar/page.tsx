import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/data";
import { getAppointments } from "@/lib/data";
import { CalendarClient } from "./calendar-client";

export const metadata: Metadata = { title: "Calendario" };

export default async function CalendarPage() {
  const user = await getCurrentUser();
  const appointments = await getAppointments(user?.tenantId ?? "demo");

  return <CalendarClient initialAppointments={appointments} tenantId={user?.tenantId ?? "demo"} />;
}
