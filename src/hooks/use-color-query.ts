import { isValidHex } from "@/utils/color-utils";
import { useQueryState } from "nuqs";
import { useCallback } from "react";

/**
 * Reads and writes the `color` query parameter.
 *
 * @returns A [color, setColor] tuple, shaped like useState
 */
export function useColorQuery() {
  const [color, setColor] = useQueryState("color", {
    defaultValue: "",
    parse: (value: string) => {
      // Only accept a valid hex colour
      if (!value) return "";
      const normalized = value.startsWith("#") ? value : `#${value}`;
      return isValidHex(normalized) ? normalized : "";
    },
    serialize: (value: string) => {
      // Drop the leading # so the URL stays readable
      return value.startsWith("#") ? value.slice(1) : value;
    },
  });

  /**
   * Updates the colour, validating the format first.
   *
   * Memoized so it can be declared as an effect dependency without
   * resubscribing that effect on every render.
   *
   * @param newColor - The new colour in hex form
   */
  const updateColor = useCallback(
    (newColor: string) => {
      if (!newColor) {
        setColor("");
        return;
      }

      const normalized = newColor.startsWith("#") ? newColor : `#${newColor}`;

      if (isValidHex(normalized)) {
        setColor(normalized);
      }
    },
    [setColor]
  );

  return [color, updateColor] as const;
}
