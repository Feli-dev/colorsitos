"use client";

import { ColorShowcase } from "@/components/playground/color-showcase";
import { PaletteVisualizer } from "@/components/playground/palette-visualizer";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { ColorPalette } from "@/types/colors";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PlaygroundDrawerProps {
  palette: ColorPalette;
  trigger?: React.ReactNode;
}

export function PlaygroundDrawer({ palette, trigger }: PlaygroundDrawerProps) {
  const t = useTranslations("playground");
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Sparkles className="h-4 w-4" />
      {t("viewInAction")}
    </Button>
  );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{trigger || defaultTrigger}</DrawerTrigger>
      <DrawerContent className="min-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("title")} - {palette.name}
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-6 pb-6 overflow-y-auto">
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Palette Visualizer */}
            <PaletteVisualizer palette={palette} />

            {/* Color Showcase */}
            <ColorShowcase palette={palette} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
