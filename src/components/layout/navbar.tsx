import { Logo } from "@/components/logo";
import { Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

export default function Navbar() {
  const t = useTranslations("HomePage");

  return (
    <nav className="w-full py-6">
      <div className="container flex items-center justify-between sm:justify-around mx-auto px-4 sm:px-6 lg:px-8">
        <span
          className={`flex items-center gap-3 font-bold tracking-tight transition-colors duration-300 text-lg sm:text-xl text-neutral-800 dark:text-neutral-200`}
        >
          <Logo size="size-6" interactive />
          <span className="whitespace-nowrap">{t("title")}</span>
        </span>
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
            <span
              aria-hidden="true"
              className="h-6 w-0.5 bg-neutral-700 dark:bg-neutral-700 rounded self-center"
            />
            <div className="cursor-pointer size-10 flex items-center justify-center">
              <AnimatedThemeToggler className="cursor-pointer h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
