"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/layout/language-selector";
import { Logo } from "@/components/brand/logo";
import { useLanguage } from "@/lib/i18n/language-provider";

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <header className="flex h-[72px] items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Hamburger menu — visible on mobile only */}
        <button
          onClick={onMenuToggle}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Abrir menú"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="lg:hidden"><Logo height={24} /></div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector />

        {/* Notifications */}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-3 border-l pl-3">
          <Avatar
            src={session?.user?.image}
            name={session?.user?.name}
            size="sm"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            {t("sign.out")}
          </Button>
        </div>
      </div>
    </header>
  );
}
