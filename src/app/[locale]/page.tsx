"use client";

import { ColorSquareDisplay } from "@/components/color-square-display";
import { PaletteGenerator } from "@/components/palette-generator";

export default function Home() {
  return (
    <div>
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center my-10">
          <ColorSquareDisplay />
        </div>

        {/* Palette Generator */}
        <PaletteGenerator />
      </div>
    </div>
  );
}
