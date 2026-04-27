import type { Metadata } from "next";
import { getAgentConfig } from "@/lib/tenant-config";
import { getCurrentUser } from "@/lib/data";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const config = await getAgentConfig(user?.tenantId);

  return <SettingsClient config={config} />;
}
