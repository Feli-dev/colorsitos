import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyToClipboard } from "./use-copy-to-clipboard";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const toastMessage = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    message: (...args: unknown[]) => toastMessage(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const writeText = vi.fn<(value: string) => Promise<void>>();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset().mockResolvedValue(undefined);
  toastMessage.mockReset();
  toastError.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCopyToClipboard", () => {
  it("writes the value and reports success", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("#3182CE");
    });

    expect(writeText).toHaveBeenCalledWith("#3182CE");
    expect(ok).toBe(true);
  });

  it("marks only the copied value as copied", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("#3182CE");
    });

    expect(result.current.isCopied("#3182CE")).toBe(true);
    expect(result.current.isCopied("#E53E3E")).toBe(false);
    expect(result.current.copiedValue).toBe("#3182CE");
  });

  it("clears the indicator after the reset delay", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("#3182CE");
    });
    expect(result.current.copiedValue).toBe("#3182CE");

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copiedValue).toBeNull();
  });

  it("restarts the timer when a second value is copied", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("#3182CE");
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    await act(async () => {
      await result.current.copy("#E53E3E");
    });

    // The first copy's timer must not clear the second copy's indicator.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copiedValue).toBe("#E53E3E");
  });

  it("stays silent on success by default", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("#3182CE");
    });

    expect(toastMessage).not.toHaveBeenCalled();
  });

  it("toasts on success when asked to", async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ toastOnSuccess: true })
    );

    await act(async () => {
      await result.current.copy("#3182CE");
    });

    expect(toastMessage).toHaveBeenCalledWith(
      "success",
      expect.objectContaining({ description: "#3182CE" })
    );
  });

  it("always surfaces a failure, and reports it", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useCopyToClipboard());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("#3182CE");
    });

    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
    expect(result.current.copiedValue).toBeNull();
  });

  it("surfaces failures even with success toasts switched off", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() =>
      useCopyToClipboard({ toastOnSuccess: false })
    );

    await act(async () => {
      await result.current.copy("#3182CE");
    });

    // Silence on failure was the original bug; it must not be configurable.
    expect(toastError).toHaveBeenCalled();
  });

  it("does not set state after unmount", async () => {
    const { result, unmount } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("#3182CE");
    });
    unmount();

    // Would warn or throw if the reset timer outlived the component.
    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
  });
});
