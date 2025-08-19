"use client";

import { ColorfulTitle } from "@/components/colorful-title";
import { PaletteGenerator } from "@/components/palette-generator";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-lvh">
        {/* Header */}
        <div className="text-center mb-10">
          <ColorfulTitle>{t("title")}</ColorfulTitle>
        </div>

        {/* Palette Generator */}
        <PaletteGenerator />
      </div>
    </div>
  );
}
