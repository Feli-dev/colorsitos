"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const prefersDark = getSystemPrefersDark();
  const willBeDark = mode === "dark" || (mode === "system" && prefersDark);

  html.classList.toggle("dark", willBeDark);
  // Ensure UA widgets pick the palette without using any casts
  html.style.setProperty("color-scheme", willBeDark ? "dark" : "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const mediaListenerRef = useRef<((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null>(null);

  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (theme === "light") return "light";
    if (theme === "dark") return "dark";
    return getSystemPrefersDark() ? "dark" : "light";
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      if (mode === "system") {
        localStorage.setItem("theme", "system");
      } else {
        localStorage.setItem("theme", mode);
      }
    } catch {}
    applyThemeClass(mode);
  }, []);

  useEffect(() => {
    // Initialize from localStorage or system
    try {
      const stored = localStorage.getItem("theme") as ThemeMode | null;
      const initial: ThemeMode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
      setThemeState(initial);
      applyThemeClass(initial);
    } catch {
      applyThemeClass("system");
    }

    // Listen to system changes when in system mode
    const mql: MediaQueryList | null = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const handler: (this: MediaQueryList, ev: MediaQueryListEvent) => void = () => {
      if (theme === "system") applyThemeClass("system");
    };
    if (mql && mql.addEventListener) {
      mql.addEventListener("change", handler);
      mediaListenerRef.current = handler;
    }

    // Sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        const next = (e.newValue as ThemeMode) || "system";
        setThemeState(next);
        applyThemeClass(next);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      if (mql && mql.removeEventListener && mediaListenerRef.current) {
        mql.removeEventListener("change", mediaListenerRef.current);
      }
      window.removeEventListener("storage", onStorage);
    };
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}