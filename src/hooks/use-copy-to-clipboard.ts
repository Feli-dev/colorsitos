"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** How long the copied indicator stays lit, in milliseconds. */
const RESET_AFTER_MS = 2000;

interface UseCopyToClipboardOptions {
  /**
   * Show a toast on success as well as on failure.
   *
   * Off by default on purpose: two of the existing call sites only flip an icon
   * when a copy succeeds, and turning that into a toast would be a behaviour
   * change rather than a fix. Failure is always announced, because silence there
   * is the actual bug.
   */
  toastOnSuccess?: boolean;
}

interface UseCopyToClipboard {
  /** Copies `value`, returning whether it succeeded. */
  copy: (value: string) => Promise<boolean>;
  /** The most recently copied value, or null once the indicator resets. */
  copiedValue: string | null;
  /** Whether `value` is the one currently showing as copied. */
  isCopied: (value: string) => boolean;
}

/**
 * Clipboard copying with a self-resetting indicator and visible failures.
 *
 * Three components used to implement this separately, each with its own copied
 * state and its own reset timer. Two of them swallowed failures entirely — an
 * empty `catch` — so a user with a blocked clipboard saw the icon simply never
 * change and had no way to tell the app from a broken app.
 *
 * The pattern here is the one `ColorTooltip` already had right; this lifts it out
 * so every caller gets it.
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboard {
  const { toastOnSuccess = false } = options;
  const t = useTranslations("palette.copy");
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Without this, copying and then navigating away sets state on a dead component.
  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedValue(value);

        if (toastOnSuccess) {
          toast.message(t("success"), { description: value, duration: 2000 });
        }

        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(
          () => setCopiedValue(null),
          RESET_AFTER_MS
        );

        return true;
      } catch (error) {
        console.error(t("error"), error);
        toast.error(t("error"), { duration: 3000 });
        return false;
      }
    },
    [t, toastOnSuccess]
  );

  const isCopied = useCallback(
    (value: string) => copiedValue === value,
    [copiedValue]
  );

  return { copy, copiedValue, isCopied };
}
