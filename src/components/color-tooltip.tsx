/**
 * @fileoverview ColorTooltip component for displaying color information with copy functionality
 *
 * This component provides a reusable tooltip that displays color values in different formats
 * with optional copy functionality. It includes a color swatch, the color value text,
 * and copy status indicator.
 *
 * Key features:
 * - Supports multiple color formats (hex, hsl, oklch, rgb)
 * - Optional copy functionality with visual feedback
 * - Consistent styling with existing tooltip components
 * - Clipboard integration with error handling
 */

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

/**
 * Props for the ColorTooltip component
 */
interface ColorTooltipProps {
  /** The color value to display and copy (in any format: hex, hsl, oklch, rgb) */
  colorValue: string;
  /** The actual hex color for the preview swatch (if different from colorValue) */
  hexColor?: string;
  /** Whether to show the copy icon (copy functionality is always enabled on trigger click) */
  showCopyIcon?: boolean;
  /** The trigger element that shows the tooltip on hover/focus */
  children: ReactNode;
  /** Optional controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Callback when color is successfully copied */
  onCopy?: (colorValue: string) => void;
  /** Optional custom CSS classes for the tooltip content */
  className?: string;
}

/**
 * Extracts hex color from various color format strings
 * @param colorValue - Color value in any format
 * @returns Hex color string or the original value if already hex
 */
function extractHexColor(colorValue: string): string {
  // If it's already a hex color, return as is
  if (colorValue.startsWith("#")) {
    return colorValue;
  }

  // For other formats, we'll use the colorValue as fallback
  // In a real implementation, you might want to add conversion utilities
  return colorValue;
}

/**
 * ColorTooltip component that displays color information with optional copy functionality
 * Maintains the same visual style and behavior as the original tooltip
 *
 * @param colorValue - The color value to display and copy (in any format: hex, hsl, oklch, rgb)
 * @param hexColor - Optional hex color for the preview swatch (if different from colorValue)
 * @param showCopyIcon - Whether to show the copy icon (copy functionality always enabled on trigger click, default: true)
 * @param children - The trigger element that shows the tooltip on hover/focus
 * @param open - Optional controlled open state
 * @param onOpenChange - Callback when open state changes
 * @param onCopy - Callback when color is successfully copied
 * @param className - Optional custom CSS classes for the tooltip content
 */
export function ColorTooltip({
  colorValue,
  hexColor,
  showCopyIcon = true,
  children,
  open,
  onOpenChange,
  onCopy,
  className,
}: ColorTooltipProps) {
  /** Currently copied color value for visual feedback */
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  /** Translation function for internationalization */
  const t = useTranslations();

  // Use provided hex color or extract from color value
  const displayHexColor = hexColor ?? extractHexColor(colorValue);

  /**
   * Handles copying color value to clipboard and shows feedback
   * @param value - The color value to copy
   */
  const handleCopyColor = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedColor(value);

      // Show success toast
      toast.message(t("palette.copy.success"), {
        description: value,
        duration: 2000,
      });

      // Notify parent component about successful copy
      onCopy?.(value);

      // Reset copied state after 2.5 seconds (same as original)
      setTimeout(() => {
        setCopiedColor(null);
      }, 2500);
    } catch (err) {
      console.error(t("palette.copy.error"), err);
      // Show error toast
      toast.error(t("palette.copy.error"), {
        description: t("palette.copy.error"),
        duration: 3000,
      });
    }
  };

  /**
   * Handles tooltip open/close state changes
   * Prevents closing tooltip when showing copy success feedback
   */
  const handleTooltipOpenChange = (openState: boolean) => {
    // Only allow closing if we're not showing copy feedback or the copied color doesn't match
    if (copiedColor === null || copiedColor !== colorValue) {
      onOpenChange?.(openState);
    }
  };

  /**
   * Handles click on the trigger element to copy color
   * Always allows copying regardless of showCopyIcon setting
   */
  const handleTriggerClick = () => {
    handleCopyColor(colorValue);
  };

  return (
    <Tooltip open={open} onOpenChange={handleTooltipOpenChange}>
      <TooltipTrigger asChild onClick={handleTriggerClick}>
        {children}
      </TooltipTrigger>
      {/* Tooltip content with same styling as original */}
      <TooltipContent
        className={`bg-gray-900 dark:bg-gray-200 p-2 rounded-lg ${
          className ?? ""
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Color preview swatch */}
          <div
            className="size-4 rounded"
            style={{ backgroundColor: displayHexColor }}
          />
          {/* Color value display */}
          <span className="font-bold text-xs">{colorValue}</span>
          {/* Copy status icon - show only if enabled */}
          {showCopyIcon ? (
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the trigger click
                handleCopyColor(colorValue);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation(); // Prevent triggering the trigger click
                  handleCopyColor(colorValue);
                }
              }}
              aria-label={`${t("palette.copy.title")}: ${colorValue}`}
            >
              {/* Copy status icon - check mark when copied, copy icon otherwise */}
              {copiedColor === colorValue ? (
                <Check className="h-3 w-3 text-green-300 dark:text-green-700" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground dark:text-black" />
              )}
            </div>
          ) : null}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
