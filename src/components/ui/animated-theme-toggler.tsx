"use client";

import { cn } from "@/lib/utils";
import { Moon, SunDim } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update local state when theme changes
  useEffect(() => {
    if (mounted) {
      setIsDarkMode(resolvedTheme === "dark");
    }
  }, [resolvedTheme, mounted]);
  const changeTheme = async () => {
    if (!buttonRef.current || !mounted) return;

    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button ref={buttonRef} className={cn(className)} disabled>
        <Moon />
      </button>
    );
  }

  return (
    <button ref={buttonRef} onClick={changeTheme} className={cn(className)}>
      {isDarkMode ? <SunDim /> : <Moon />}
    </button>
  );
};
