"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useLanguage } from "@/lib/i18n/language-provider";

export function LandingHeader() {
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-white/70 transition-colors hover:text-white">
            {t("landing.features")}
          </Link>
          <Link href="#pricing" className="text-sm text-white/70 transition-colors hover:text-white">
            {t("landing.pricing")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">{t("landing.sign_in")}</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{t("landing.get_started")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
