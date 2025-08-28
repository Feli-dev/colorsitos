"use client";

import { Logo } from "@/components/logo";
import { Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

export default function Navbar() {
  const t = useTranslations("HomePage");
  const tPlayground = useTranslations("playground");
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    // Navigate to home page
    router.push("/");

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Dispatch custom event to reset the form
    window.dispatchEvent(new CustomEvent("resetPaletteForm"));
  };

  return (
    <nav className="w-full py-6">
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
            <button
              onClick={() => router.push("/playground")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                pathname?.includes("/playground")
                  ? "bg-primary text-primary-foreground"
                  : "text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              aria-label={tPlayground("title")}
            >
              {tPlayground("title")}
            </button>
            <span
              aria-hidden="true"
              className="h-6 w-0.5 bg-neutral-700 dark:bg-neutral-700 rounded self-center"
            />
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
            {/* TODO: Add GitHub link when the project is open source */}
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
