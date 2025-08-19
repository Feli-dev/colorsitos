"use client";

import { useAutoRandomFavicon } from "@/hooks/use-dynamic-favicon";

/**
 * Component that handles the dynamic favicon
 * It runs on the client side to use hooks
 */
export function DynamicFavicon() {
  useAutoRandomFavicon();

  // This component does not render anything visible
  return null;
}
