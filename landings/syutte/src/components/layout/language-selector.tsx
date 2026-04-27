"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import type { Language } from "@/lib/i18n/translations";

function FlagES({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 16" fill="none" aria-hidden="true">
      <rect width="24" height="16" rx="1.5" fill="#f1c40f" />
      <rect width="24" height="4" fill="#c72a2a" />
      <rect y="12" width="24" height="4" fill="#c72a2a" />
    </svg>
  );
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 16" fill="none" aria-hidden="true">
      {/* Blue base */}
      <rect width="24" height="16" rx="1.5" fill="#012169" />
      {/* White diagonal cross (saltire) */}
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="2.5" />
      {/* Red diagonal cross */}
      <path d="M0 0l24 16M24 0L0 16" stroke="#c72a2a" strokeWidth="1.2" />
      {/* White vertical + horizontal cross */}
      <rect x="10.5" width="3" height="16" fill="#fff" />
      <rect y="6.5" width="24" height="3" fill="#fff" />
      {/* Red vertical + horizontal cross */}
      <rect x="11.5" width="1" height="16" fill="#c72a2a" />
      <rect y="7.5" width="24" height="1" fill="#c72a2a" />
    </svg>
  );
}

const languages: { value: Language; label: string; Flag: typeof FlagES }[] = [
  { value: "es", label: "ES", Flag: FlagES },
  { value: "en", label: "EN", Flag: FlagGB },
];

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-md">
      {languages.map(({ value, label, Flag }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            lang === value
              ? "bg-white text-[#1a1a1a] shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
          aria-label={label}
        >
          <Flag className="h-3.5 w-5 shrink-0 rounded-sm" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
