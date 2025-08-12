"use client";

import { PaletteGenerator } from "@/components/palette-generator";
/* import { GeistSans } from "geist/font/sans"; */
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-lvh">
        {/* Header */}
        {/* <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <span className={`${GeistSans.className} font-bold`}>
              {t("title")}
            </span>
          </h1>
        </div> */}

        {/* Palette Generator */}
        <PaletteGenerator />
      </div>
    </div>
  );
}
