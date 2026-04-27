"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function CTASection() {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="border-t border-border bg-[#1a1a1a] py-24">
      <div
        ref={ref}
        className="mx-auto max-w-3xl px-6 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
          {t("cta.title_1")}{" "}
          <span className="text-hologram">{t("cta.title_2")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-white/60">
          {t("cta.subtitle")}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button variant="hologram" size="lg" className="text-base">
              {t("cta.start_trial")}
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="text-base">
              {t("cta.learn_more")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
