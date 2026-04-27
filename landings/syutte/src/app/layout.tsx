import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: {
    default: "Suytte — AI Phone Agents for Real Estate",
    template: "%s | Suytte",
  },
  description:
    "AI-powered phone agents that answer calls, capture leads, and schedule visits for real estate agencies. Never miss a lead again.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geistSans.className}>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
