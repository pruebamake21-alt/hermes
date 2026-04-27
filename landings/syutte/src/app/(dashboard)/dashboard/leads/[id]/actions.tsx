"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateLeadStatus } from "@/lib/actions/lead";

const statuses = ["Nuevo", "Contactado", "Visita_programada", "Descartado", "Ganado"];

export function LeadsActions({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  async function handleStatusChange(status: string) {
    try {
      await updateLeadStatus(leadId, status);
      router.refresh();
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  }

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          variant={status === currentStatus ? "default" : "outline"}
          size="sm"
          disabled={status === currentStatus}
          onClick={() => handleStatusChange(status)}
        >
          {status.replace("_", " ")}
        </Button>
      ))}
    </div>
  );
}
