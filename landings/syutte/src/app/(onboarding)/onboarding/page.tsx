import type { Metadata } from "next";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = { title: "Configuración Inicial" };

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
