"use client";

import { PaletteComparator } from "@/components/palette-comparator";
import { GeistSans } from "geist/font/sans";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <span className={`${GeistSans.className} font-bold`}>
              Colorsitos
            </span>
          </h1>
        </div>

        {/* Palette Comparator */}
        <PaletteComparator />
      </div>
    </div>
  );
}
