"use client";

import type { PinnableRole, RampPins } from "@/types/colors";
import { isValidHex } from "@/utils/color-utils";
import { createParser, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

/**
 * Sibling hook to `use-color-query.ts` -- that hook is NOT modified by this
 * one (R1, top risk: verify with `git diff --stat src/hooks/use-color-query.ts`,
 * which stays empty). Pins live in five independent, optional query params,
 * one per `PinnableRole`, so a legacy `?color=X` URL alone yields `{}` pins:
 * nothing in this hook ever reads or writes the `color` param.
 */

const PINNABLE_ROLES: readonly PinnableRole[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
];

/** A query param that only ever holds a valid hex colour, or is absent. Malformed input parses to `null`, never throws. */
function hexParam() {
  return createParser<string>({
    parse: (value) => {
      if (!value) return null;
      const normalized = value.startsWith("#") ? value : `#${value}`;
      return isValidHex(normalized) ? normalized : null;
    },
    serialize: (value) => (value.startsWith("#") ? value.slice(1) : value),
  });
}

const PIN_PARSERS = {
  neutral: hexParam(),
  accent: hexParam(),
  success: hexParam(),
  warning: hexParam(),
  danger: hexParam(),
};

/**
 * Reads and writes the five ramp-pin query params.
 *
 * @returns A `[pins, setPin]` tuple. `pins` is a flat `RampPins` (M5) with
 * only the roles actually present and valid in the URL; `setPin(role, null)`
 * clears that role's param.
 */
export function useRampPinsQuery() {
  const [params, setParams] = useQueryStates(PIN_PARSERS);

  const pins: RampPins = useMemo(() => {
    const result: RampPins = {};
    for (const role of PINNABLE_ROLES) {
      const value = params[role];
      if (value) result[role] = value;
    }
    return result;
  }, [params]);

  const setPin = useCallback(
    (role: PinnableRole, hex: string | null) => setParams({ [role]: hex }),
    [setParams]
  );

  return [pins, setPin] as const;
}
