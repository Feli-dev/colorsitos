"use client";

import { ChevronDown, Coffee, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
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
      className={`cursor-pointer fixed bottom-4 right-18 md:right-[5.5rem] 
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
          size-fit rounded-lg backdrop-blur-md border-2 shadow-xl gap-2 p-2
          flex items-center justify-center transition-all duration-300
          hover:bg-gray-50 dark:hover:bg-black/40
          cursor-pointer
        `}
        aria-label={t("support.ariaLabel")}
      >
        {/*
          A span, not a heading. This is the button's visible label — it sits
          inside the <button> and names the control, which is not what a heading
          is for. As an <h1> it made the page announce two top-level headings and
          put a heading inside a control, both of which break outline navigation.
          Tailwind's preflight resets heading defaults, so the classes here
          already carry the whole appearance.
        */}
        <span className="font-grotesk font-bold text-sm sm:text-base text-nowrap whitespace-nowrap">
          {t("support.title")}
        </span>
        {isOpen ? (
          <ChevronDown className="text-gray-600 dark:text-white/80" />
        ) : (
          <Heart className="text-red-600" />
        )}
      </button>
    </div>
  );
}

export { SupportButton };
