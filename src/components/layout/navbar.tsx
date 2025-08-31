"use client";

import { Logo } from "@/components/logo";
import { Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

/**
 * Navigation bar component that provides site navigation, branding, and theme toggle.
 * Includes social media links, logo click handling for navigation, and responsive design.
 * Handles smooth scrolling to top and form reset events when logo is clicked.
 *
 * @returns The navigation bar JSX element with branding and controls
 */
export default function Navbar() {
  const t = useTranslations("HomePage");
  const router = useRouter();

  /**
   * Handles logo click events to navigate to home page and reset application state.
   * Performs smooth scroll to top and dispatches form reset event for palette generator.
   */
  const handleLogoClick = () => {
    // Navigate to home page
    router.push("/");

    // Smooth scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Dispatch custom event to reset the palette form
    window.dispatchEvent(new CustomEvent("resetPaletteForm"));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full py-6">
      <div className="container flex items-center justify-between sm:justify-around mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={handleLogoClick}
          className={`flex items-center gap-3 font-bold tracking-tight transition-all duration-300 text-lg sm:text-xl text-neutral-800 dark:text-neutral-200 hover:text-neutral-600 dark:hover:text-neutral-400 cursor-pointer`}
          aria-label={t("title")}
        >
          <Logo size="size-6" interactive />
          <span className="whitespace-nowrap">{t("title")}</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <a
              href={"https://x.com/FeliDev_"}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer size-10 flex items-center justify-center"
              aria-label="Twitter"
            >
              <Twitter
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400`}
                strokeWidth={2}
              />
            </a>
            {/* TODO: Add GitHub link when the project becomes open source */}
            {/* <a
              href={"https://github.com/Feli-dev/colorsitos"}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full p-1.5 sm:p-2 transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800`}
              aria-label="GitHub"
            >
              <Github
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400`}
                strokeWidth={2}
              />
            </a> */}
            <div className="cursor-pointer size-10 flex items-center justify-center">
              <AnimatedThemeToggler className="cursor-pointer h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
