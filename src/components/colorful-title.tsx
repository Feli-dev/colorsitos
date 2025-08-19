"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { rgbToHex } from "@/utils/color-utils";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface ColorSquare {
  id: number;
  color: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  animationDuration: number;
}

interface ColorfulTitleProps {
  children: string;
}

function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

function generateRandomPosition(
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const textZoneWidth = 600;
  const textZoneHeight = 200;

  let x, y;
  do {
    x = Math.random() * (containerWidth - 60);
    y = Math.random() * (containerHeight - 60);
  } while (
    x > centerX - textZoneWidth / 2 &&
    x < centerX + textZoneWidth / 2 &&
    y > centerY - textZoneHeight / 2 &&
    y < centerY + textZoneHeight / 2
  );

  return { x, y };
}

export function ColorfulTitle({ children }: ColorfulTitleProps) {
  const [colorSquares, setColorSquares] = useState<ColorSquare[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [openTooltips, setOpenTooltips] = useState<Record<number, boolean>>({});
  const [containerSize] = useState({
    width: 900,
    height: 250,
  });
  const t = useTranslations();

  const handleCopyColor = async (hex: string, squareId: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);

      // Mantener el tooltip abierto para mostrar feedback
      setOpenTooltips((prev) => ({ ...prev, [squareId]: true }));

      // Cerrar tooltip y limpiar estado después de 2.5 segundos
      setTimeout(() => {
        setCopiedColor(null);
        setOpenTooltips((prev) => ({ ...prev, [squareId]: false }));
      }, 2500);
    } catch (err) {
      console.error(t("palette.copy.error"), err);
    }
  };

  const handleTooltipOpenChange = (open: boolean, squareId: number) => {
    // Solo permitir el control natural del tooltip si no estamos mostrando feedback de copiado
    if (
      copiedColor === null ||
      copiedColor !== colorSquares.find((s) => s.id === squareId)?.color
    ) {
      setOpenTooltips((prev) => ({ ...prev, [squareId]: open }));
    }
  };

  useEffect(() => {
    const squares: ColorSquare[] = [];
    const numSquares = 20;

    for (let i = 0; i < numSquares; i++) {
      const position = generateRandomPosition(
        containerSize.width,
        containerSize.height
      );
      squares.push({
        id: i,
        color: generateRandomColor(),
        x: position.x,
        y: position.y,
        size: Math.random() * 15 + 35,
        rotation: Math.random() * 360,
        animationDuration: 2 + Math.random() * 2,
      });
    }

    setColorSquares(squares);
  }, [containerSize]);

  return (
    <TooltipProvider>
      <div
        className="relative flex items-center justify-center"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          maxWidth: "100%",
        }}
      >
        {colorSquares.map((square) => (
          <Tooltip
            key={square.id}
            open={openTooltips[square.id] ?? false}
            onOpenChange={(open) => handleTooltipOpenChange(open, square.id)}
          >
            <TooltipTrigger asChild>
              <div
                className="absolute rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:animate-none cursor-pointer animate-pulse"
                style={{
                  left: `${square.x}px`,
                  top: `${square.y}px`,
                  width: `${square.size}px`,
                  height: `${square.size}px`,
                  backgroundColor: square.color,
                  transform: `rotate(${square.rotation}deg)`,
                  animationDelay: `${square.id * 0.1}s`,
                  animationDuration: `${square.animationDuration}s`,
                }}
                onClick={() => handleCopyColor(square.color, square.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCopyColor(square.color, square.id);
                  }
                }}
                aria-label={`${t("palette.copy.title")}: ${square.color}`}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-200">
              <div className="flex items-center gap-2">
                <div
                  className="size-4 rounded"
                  style={{ backgroundColor: square.color }}
                />
                <span className="font-bold text-xs">{square.color}</span>
                {copiedColor === square.color ? (
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-300 dark:text-green-700" />
                  </div>
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground dark:text-black" />
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="relative z-10 text-center">
          <h1 className="font-grotesk font-bold text-6xl lg:text-7xl text-shadow-lg/30 select-none">
            {children}
          </h1>
        </div>
      </div>
    </TooltipProvider>
  );
}
