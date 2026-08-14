"use client";

import { ColorSquareDisplay } from "@/features/hero/color-square-display";
import Hero from "@/features/hero/hero";
import { PaletteGenerator } from "@/features/palette-generator/palette-generator";

/**
 * Main home page component that renders the complete user interface.
 * This includes the hero section, color display, and palette generator.
 * The page is structured with semantic sections and smooth scrolling behavior.
 *
 * @returns The main home page JSX element with all core components
 */
export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      <div className="max-w-4xl mx-auto min-h-[90dvh] md:min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center my-10" data-generator>
          <ColorSquareDisplay />
        </div>

        {/* Palette Generator */}
        <div>
          <PaletteGenerator />
        </div>
      </div>
    </div>
  );
}
