"use client";

import { ColorfulTitle } from "@/components/colorful-title";
import { PaletteGenerator } from "@/components/palette-generator";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div>
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center my-10">
          <ColorfulTitle>{t("title")}</ColorfulTitle>
        </div>

        {/* Palette Generator */}
        <PaletteGenerator />
      </div>
    </div>
  );
}
