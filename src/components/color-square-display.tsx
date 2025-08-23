/**
 * @fileoverview ColorSquareDisplay component with interactive animated color squares
 *
 * This component displays a collection of randomly colored squares with collision-free
 * positioning. Users can click on squares to copy their hex values to clipboard.
 * Features include smooth animations, hover effects, and accessibility support.
 *
 * Key features:
 * - Collision detection algorithm to prevent overlapping squares
 * - Clipboard integration for color copying
 * - Internationalization support
 * - Responsive design with fallback grid positioning
 * - Accessibility compliance with ARIA labels and keyboard navigation
 */

"use client";

import { ColorTooltip } from "@/components/color-tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { rgbToHex } from "@/utils/color-utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/**
 * Represents a color square with position, appearance, and animation properties
 */
interface ColorSquare {
  /** Unique identifier for the square */
  id: number;
  /** Hex color value (e.g., "#FF5733") */
  color: string;
  /** Horizontal position in pixels */
  x: number;
  /** Vertical position in pixels */
  y: number;
  /** Size of the square in pixels */
  size: number;
  /** Rotation angle in degrees */
  rotation: number;
  /** Animation duration in seconds */
  animationDuration: number;
}

/**
 * Generates a random color in hexadecimal format
 * @returns A random hex color string (e.g., "#FF5733")
 */
function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

/**
 * Generates uniform positions for color squares that avoid overlapping
 * Uses collision detection algorithm with fallback grid positioning
 * @param containerWidth - Width of the container in pixels
 * @param containerHeight - Height of the container in pixels
 * @param numSquares - Number of squares to position
 * @param squareSizes - Array of square sizes corresponding to each square
 * @returns Array of position objects with x and y coordinates
 */
function generateUniformPositions(
  containerWidth: number,
  containerHeight: number,
  numSquares: number,
  squareSizes: number[]
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const attempts = 100; // Maximum attempts to find non-overlapping position

  // Padding from container edges
  const padding = 20;

  for (let i = 0; i < numSquares; i++) {
    let position: { x: number; y: number } | null = null;
    let attempt = 0;

    while (!position && attempt < attempts) {
      const x =
        padding +
        Math.random() * (containerWidth - squareSizes[i] - padding * 2);
      const y =
        padding +
        Math.random() * (containerHeight - squareSizes[i] - padding * 2);

      // Check if this position causes overlap with existing positions
      const hasOverlap = positions.some((existingPos, index) => {
        const distance = Math.sqrt(
          Math.pow(x - existingPos.x, 2) + Math.pow(y - existingPos.y, 2)
        );
        const minDistance = (squareSizes[i] + squareSizes[index]) / 2 + 5; // 5px margin
        return distance < minDistance;
      });

      if (!hasOverlap) {
        position = { x, y };
      }

      attempt++;
    }

    // If no non-overlapping position found, use fallback grid position
    if (!position) {
      const fallbackX = (i % 4) * (containerWidth / 4) + padding;
      const fallbackY =
        Math.floor(i / 4) * (containerHeight / Math.ceil(numSquares / 4)) +
        padding;
      position = {
        x: Math.min(fallbackX, containerWidth - squareSizes[i] - padding),
        y: Math.min(fallbackY, containerHeight - squareSizes[i] - padding),
      };
    }

    positions.push(position);
  }

  return positions;
}

/**
 * ColorSquareDisplay component that displays animated, interactive color squares
 * Users can click on squares to copy their hex values to clipboard
 * Features collision-free positioning and smooth animations
 */
export function ColorSquareDisplay() {
  /** Array of color squares with their properties */
  const [colorSquares, setColorSquares] = useState<ColorSquare[]>([]);
  /** Track which tooltips are open for each square */
  const [openTooltips, setOpenTooltips] = useState<Record<number, boolean>>({});
  /** Fixed container dimensions for consistent layout */
  const [containerSize] = useState({
    width: 900,
    height: 100,
  });
  /** Translation function for internationalization */
  const t = useTranslations();

  /**
   * Handles color copy event - keeps tooltip open for 2.5 seconds
   * @param colorValue - The color value that was copied
   * @param squareId - ID of the square whose color was copied
   */
  const handleColorCopy = (colorValue: string, squareId: number) => {
    // Show tooltip immediately
    setOpenTooltips((prev) => ({ ...prev, [squareId]: true }));

    // Hide tooltip after 2.5 seconds
    setTimeout(() => {
      setOpenTooltips((prev) => ({ ...prev, [squareId]: false }));
    }, 2500);
  };

  /**
   * Handles tooltip open/close state changes
   * @param open - Whether the tooltip should be open
   * @param squareId - ID of the square whose tooltip is changing
   */
  const handleTooltipOpenChange = (open: boolean, squareId: number) => {
    setOpenTooltips((prev) => ({ ...prev, [squareId]: open }));
  };

  // Initialize color squares with collision-free positioning
  useEffect(() => {
    const numSquares = 15; // Total number of squares to display

    // Generate sizes first to calculate optimal positions
    const sizes = Array.from(
      { length: numSquares },
      () => Math.random() * 15 + 35 // Random size between 35-50px
    );

    // Generate uniform positions that avoid overlapping
    const positions = generateUniformPositions(
      containerSize.width,
      containerSize.height,
      numSquares,
      sizes
    );

    // Create color square objects with generated properties
    const squares: ColorSquare[] = [];
    for (let i = 0; i < numSquares; i++) {
      squares.push({
        id: i,
        color: generateRandomColor(),
        x: positions[i].x,
        y: positions[i].y,
        size: sizes[i],
        rotation: Math.random() * 360, // Random rotation 0-360 degrees
        animationDuration: 2 + Math.random() * 2, // Animation duration 2-4 seconds
      });
    }

    setColorSquares(squares);
  }, [containerSize]);

  return (
    <TooltipProvider>
      {/* Main container for color squares with fixed dimensions */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          maxWidth: "100%",
        }}
      >
        {/* Render each color square with tooltip functionality */}
        {colorSquares.map((square) => (
          <ColorTooltip
            key={square.id}
            colorValue={square.color}
            showCopyIcon={false}
            open={openTooltips[square.id] ?? false}
            onOpenChange={(open) => handleTooltipOpenChange(open, square.id)}
            onCopy={() => handleColorCopy(square.color, square.id)}
          >
            {/* Interactive color square with hover effects and animations */}
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
              role="button"
              tabIndex={0}
              aria-label={`${t("palette.copy.title")}: ${square.color}`}
            />
          </ColorTooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
