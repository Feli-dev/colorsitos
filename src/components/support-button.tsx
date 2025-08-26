"use client";

import { ChevronDown, Coffee, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle scroll behavior for mobile
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100; // pixels to scroll before hiding text
      const isMobile = window.innerWidth < 768; // mobile breakpoint

      if (isMobile) {
        setIsScrolled(window.scrollY > scrollThreshold);
      } else {
        setIsScrolled(false);
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleBuyMeCoffee = () => {
    window.open(
      "https://www.cafecito.app/feli-dev",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      ref={dropdownRef}
      className={`cursor-pointer fixed bottom-4 
        ${isScrolled ? "right-8 " : "right-18"} md:right-[5.5rem] 
        flex items-center justify-center size-10 rounded-lg z-50`}
    >
      <div
        className={`
          absolute bottom-10 -right-18 mb-2 w-[calc(100vw-2rem)] max-w-xs sm:w-72 md:w-64 lg:w-[18rem] rounded-lg backdrop-blur-md border shadow-xl
          transform transition-all duration-300 ease-out origin-bottom-right
          bg-white border-gray-300 dark:bg-black/40 dark:border-white/10
          ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          }
        `}
      >
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Buy Me Coffee Button */}
          <button
            onClick={handleBuyMeCoffee}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all duration-200 cursor-pointer
              hover:bg-gray-300/50 text-gray-800 hover:text-gray-900
              dark:hover:bg-white/10 dark:text-white/90 dark:hover:text-white"
          >
            <div className="size-7 sm:size-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Coffee className="text-white" />
            </div>
            <span className="font-grotesk font-bold text-sm sm:text-base">
              {t("support.buyMeCoffee")}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          rounded-lg backdrop-blur-md border-2 shadow-xl p-2
          flex items-center justify-center transition-all duration-500 ease-in-out
          hover:bg-gray-50 dark:hover:bg-black/40
          cursor-pointer overflow-clip
          ${isScrolled ? "gap-0 size-12" : "gap-2 size-fit"}
        `}
        aria-label={t("support.ariaLabel")}
      >
        <div
          className={`
          flex items-center gap-2 transition-all duration-200 ease-in-out
          ${isScrolled ? "opacity-0 w-0" : "opacity-100 w-auto"}
        `}
        >
          <h1 className="font-grotesk font-bold text-sm sm:text-base text-nowrap whitespace-nowrap">
            {t("support.title")}
          </h1>
        </div>

        <div
          className={`
          transition-all duration-500 ease-in-out flex items-center justify-center
          ${isScrolled ? "transform-none" : ""}
        `}
        >
          {isOpen ? (
            <ChevronDown className="text-gray-600 dark:text-white/80 transition-transform duration-300" />
          ) : (
            <Heart
              className={`
              text-red-600 transition-all duration-500 ease-in-out
              ${isScrolled ? "transform scale-110" : "transform scale-100"}
            `}
            />
          )}
        </div>
      </button>
    </div>
  );
}

export { SupportButton };
