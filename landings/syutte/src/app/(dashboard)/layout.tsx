import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SessionProvider } from "@/components/layout/session-provider";
import { getCurrentUser } from "@/lib/data";
import { prisma } from "@/lib/prisma";

async function checkOnboarding(tenantId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { onboardingCompleted: true },
  });

  return tenant?.onboardingCompleted ?? false;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // En demo mode, no requerir sesión
  if (process.env.DEMO_MODE !== "true") {
    const session = await getServerSession(authOptions);
    if (!session) {
      redirect("/login");
    }
  }

  // Check onboarding — redirect new users to the wizard
  const user = await getCurrentUser();
  if (user?.tenantId) {
    const completed = await checkOnboarding(user.tenantId);
    if (!completed) {
      redirect("/onboarding");
    }
  }

  return (
    <SessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
