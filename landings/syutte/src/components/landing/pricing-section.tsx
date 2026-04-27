"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const plans = [
  {
    key: "free",
    price: "€0",
    period: null,
    popular: false,
    features: ["free_minutes", "free_lead_capture", "free_email", "free_dashboard"],
    ctaKey: "free_cta",
    href: "/register",
  },
  {
    key: "pro",
    price: "€79",
    period: "/month",
    popular: true,
    features: [
      "pro_minutes",
      "pro_lead_capture",
      "pro_scheduling",
      "pro_calendar",
      "pro_recordings",
      "pro_support",
    ],
    ctaKey: "pro_cta",
    href: "/register",
  },
  {
    key: "enterprise",
    price: "Custom",
    period: null,
    popular: false,
    features: [
      "enterprise_minutes",
      "enterprise_training",
      "enterprise_dashboard",
      "enterprise_api",
      "enterprise_manager",
      "enterprise_integrations",
    ],
    ctaKey: "enterprise_cta",
    href: "/contact",
  },
];

function PricingCard({
  plan,
  index,
  t,
}: {
  plan: (typeof plans)[number];
  index: number;
  t: (key: string) => string;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const delay = index * 120;

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl border p-8 transition-all duration-300 hover:border-white/30 ${
        plan.popular
          ? "border-brand bg-[#2a2a2a] shadow-xl shadow-brand/10"
          : "border-white/10 bg-[#2a2a2a] shadow-xl shadow-black/20"
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex rounded-full bg-hologram px-3 py-1 text-xs font-medium text-[#1a1a1a]">
            {t("pricing.popular")}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{t(`pricing.${plan.key}_name`)}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-medium text-white">{plan.price}</span>
          {plan.period && <span className="text-sm text-white/50">{plan.period}</span>}
        </div>
        <p className="mt-1 text-sm text-white/50">
          {t(`pricing.${plan.key}_desc`)}
        </p>
      </div>

      <ul className="mb-8 space-y-3">
        {plan.features.map((fKey) => (
          <li key={fKey} className="flex items-start gap-2 text-sm text-white/70">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm3.36 5.14a.5.5 0 00-.7-.06l-3.7 3.18-1.5-1.48a.5.5 0 10-.7.7l1.86 1.86a.5.5 0 00.7.06l4.04-3.46a.5.5 0 000-.8z" />
            </svg>
            {t(`pricing.${fKey}`)}
          </li>
        ))}
      </ul>

      <Link href={plan.href}>
        <Button
          variant={plan.popular ? "hologram" : "default"}
          className="w-full"
        >
          {t(`pricing.${plan.ctaKey}`)}
        </Button>
      </Link>
    </div>
  );
}

export function PricingSection() {
  const { t } = useLanguage();
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal();

  return (
    <section id="pricing" className="border-t border-white/10 bg-[#1a1a1a] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={titleRef}
          className="mx-auto max-w-2xl text-center"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="eye-brow mb-4 text-white/70">{t("pricing.eyebrow")}</div>
          <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
            {t("pricing.title_1")}{" "}
            <span className="text-hologram">{t("pricing.title_2")}</span>
          </h2>
          <p className="mt-4 text-lg text-white/60">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <PricingCard key={plan.key} plan={plan} index={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
