"use client";

import dynamic from "next/dynamic";
import { AuthButtons } from "./auth-buttons";
import { useLanguage } from "@/lib/i18n/language-provider";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#f2511b]/10 blur-[120px]"
          style={{
            animation: "fade-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />
        <div
          className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-[#ff8c42]/10 blur-[120px]"
          style={{
            opacity: 0,
            animation: "fade-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-24 text-center">
        {/* Eye-brow label */}
        <div
          className="eye-brow mb-6 border-[#ffffff33] text-white/60"
          style={{
            opacity: 0,
            animation: "fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-brand">
            <path d="M8 0l1.5 5.5L15 7l-5.5 1.5L8 14l-1.5-5.5L1 7l5.5-1.5L8 0z" fill="currentColor" />
          </svg>
          {t("landing.hero_eyebrow")}
        </div>

        {/* Main heading */}
        <h1
          className="max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl md:text-7xl"
          style={{
            opacity: 0,
            animation: "fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards",
          }}
        >
          {t("landing.hero_title_1")}{" "}
          <span className="text-hologram">Lead</span>
          <br />
          {t("landing.hero_title_2")}
        </h1>

        {/* Subheading */}
        <p
          className="mt-6 max-w-xl text-lg text-white/60"
          style={{
            opacity: 0,
            animation: "fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards",
          }}
        >
          {t("landing.hero_sub")}
        </p>

        {/* Auth buttons */}
        <div
          className="mt-10 w-full max-w-sm"
          style={{
            opacity: 0,
            animation: "fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards",
          }}
        >
          <AuthButtons />
        </div>

        {/* Trust badge */}
        <div
          className="mt-8 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2"
          style={{
            opacity: 0,
            animation: "fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards",
          }}
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full border-2 border-[#1a1a1a] bg-gradient-to-br from-brand to-[#ff8c42]"
              />
            ))}
          </div>
          <span className="text-xs text-white/40">{t("landing.hero_trust")}</span>
        </div>

        {/* Product preview placeholder */}
        <div
          className="mt-16 w-full max-w-5xl"
          style={{
            opacity: 0,
            animation: "fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards",
          }}
        >
          <div className="aspect-video rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent" />
        </div>
      </div>
    </section>
  );
}
