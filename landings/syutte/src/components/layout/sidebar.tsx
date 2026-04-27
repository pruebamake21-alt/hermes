"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { useLanguage } from "@/lib/i18n/language-provider";

const navigation = [
  { key: "nav.dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { key: "nav.properties", href: "/dashboard/properties", icon: "Building2" },
  { key: "nav.leads", href: "/dashboard/leads", icon: "Users" },
  { key: "nav.calendar", href: "/dashboard/calendar", icon: "Calendar" },
  { key: "nav.calls", href: "/dashboard/calls", icon: "Phone" },
  { key: "nav.analytics", href: "/dashboard/analytics", icon: "BarChart3" },
  { key: "nav.team", href: "/dashboard/team", icon: "Users" },
  { key: "nav.billing", href: "/dashboard/billing", icon: "CreditCard" },
  { key: "nav.settings", href: "/dashboard/settings", icon: "Settings" },
];

const iconPaths: Record<string, string> = {
  LayoutDashboard: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  Building2: "M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18M6 22H4a2 2 0 01-2-2v-4a2 2 0 012-2h2M6 22h12M18 22h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2M10 7h4M10 11h4M10 15h4",
  FolderKanban: "M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM8 10v4M12 10v4M16 10v4",
  BarChart3: "M12 20V10M18 20V4M6 20v-4",
  Users: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 7a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  CreditCard: "M1 4h22v16H1zM1 10h22",
  Settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  Phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
  Calendar: "M3 4h18v18H3V4zm2 2v2h14V6H5zm0 4v10h14V10H5zm2 2h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 16h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z",
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[name] || ""} />
    </svg>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex h-[72px] items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:translate-x-0.5",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <NavIcon name={item.icon} />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t p-4">
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="text-sm font-medium">{t("sidebar.free_plan")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("sidebar.upgrade_cta")}
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-3 inline-flex items-center text-xs font-medium text-primary hover:underline"
          >
            {t("sidebar.upgrade_now")}
          </Link>
          <div className="mt-3 pt-3 border-t">
            <Link
              href="/dashboard/jhklsdiu9Dsfd"
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {t("nav.admin")}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
