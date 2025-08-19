"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { rgbToHex } from "@/utils/color-utils";
import { useEffect, useState } from "react";

interface ColorSquare {
  id: number;
  color: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
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
  const [containerSize] = useState({
    width: 900,
    height: 250,
  });

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
          <Tooltip key={square.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer animate-pulse"
                style={{
                  left: `${square.x}px`,
                  top: `${square.y}px`,
                  width: `${square.size}px`,
                  height: `${square.size}px`,
                  backgroundColor: square.color,
                  transform: `rotate(${square.rotation}deg)`,
                  animationDelay: `${square.id * 0.1}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: square.color }}
                />
                <span className="font-mono text-xs">{square.color}</span>
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
