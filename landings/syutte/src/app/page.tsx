import dynamic from "next/dynamic";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";

const FeaturesSection = dynamic(
  () => import("@/components/landing/features-section").then((m) => ({ default: m.FeaturesSection })),
  { loading: () => <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" /></div> },
);

const PricingSection = dynamic(
  () => import("@/components/landing/pricing-section").then((m) => ({ default: m.PricingSection })),
  { loading: () => <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" /></div> },
);

const CTASection = dynamic(
  () => import("@/components/landing/cta-section").then((m) => ({ default: m.CTASection })),
  { loading: () => <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" /></div> },
);

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="animate-fade-in">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
