import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { AdminClient } from "./admin-client";

export const metadata: Metadata = { title: "Panel Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Only OWNER and ADMIN can access
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminClient />;
}
