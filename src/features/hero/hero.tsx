"use client";

import { CoolMode } from "@/components/vendor/magicui/cool-mode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRandomTextColors } from "@/hooks/use-random-colors";
import { Download, Eye, Image, Layers, Palette, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ColorTooltip } from "@/components/shared/color-tooltip";

/**
 * Hero section component that displays the main landing content.
 * Features animated colorful text, feature highlights, and call-to-action button
 * with particle effects. Adapts to light/dark themes with appropriate color schemes.
 *
 * @returns The hero section JSX element with animated text and feature grid
 */
const Hero = () => {
  const t = useTranslations("hero");
  const {
    regenerate,
    createColoredText,
    lightColors,
    darkColors,
    isDarkTheme,
  } = useRandomTextColors();

  /** Create colored text for the subtitle with animated color effects */
  const coloredSubtitle = useMemo(() => {
    const subtitleText = t("subtitle");
    return createColoredText(subtitleText);
  }, [t, createColoredText]);

  /**
   * Array of feature objects that define the main product capabilities.
   * Each feature includes an icon, text, description, colors, and availability status.
   */
  const features = [
    {
      icon: Download,
      text: t("features.oneClick"),
      description: t("features.oneClickDesc"),
      iconColor: isDarkTheme ? lightColors[2] : darkColors[0],
      bgColor: isDarkTheme ? darkColors[2] : lightColors[1],
      isComingSoon: false,
    },
    {
      icon: Layers,
      text: t("features.multipleFormats"),
      description: t("features.multipleFormatsDesc"),
      iconColor: isDarkTheme ? lightColors[2] : darkColors[0],
      bgColor: isDarkTheme ? darkColors[2] : lightColors[1],
      isComingSoon: false,
    },
    {
      icon: Image,
      text: t("features.imageExtraction"),
      description: t("features.imageExtractionDesc"),
      iconColor: isDarkTheme ? lightColors[2] : darkColors[0],
      bgColor: isDarkTheme ? darkColors[2] : lightColors[1],
      isComingSoon: false,
    },
    {
      icon: Eye,
      text: t("features.preview"),
      description: t("features.previewDesc"),
      iconColor: isDarkTheme ? lightColors[2] : darkColors[0],
      bgColor: isDarkTheme ? darkColors[2] : lightColors[1],
      isComingSoon: false,
    },
  ];

  return (
    <section className="font-grotesk h-[100dvh] py-16 md:py-24 flex items-center justify-center">
      <div className="max-w-screen md:max-w-6xl mx-auto px-4 md:px-0">
        {/* Main content */}
        <div className="text-center mb-12 md:mb-16">
          {/* Title */}
          {/*
            The subtitle is split into per-character buttons, each carrying its
            own aria-label. A heading's accessible name is computed from its
            descendants, so those labels were being concatenated into it and the
            h1 announced as a list of hex codes. An explicit aria-label
            short-circuits name-from-content, which lets the characters stay
            individually labelled and operable without wrecking the heading.
          */}
          <h1
            aria-label={`${t("title")} ${t("subtitle")}`}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-grotesk font-bold tracking-tight mb-4"
          >
            <span className="block text-neutral-900 dark:text-neutral-100">
              {t("title")}
            </span>
            <span className="block cursor-pointer transition-all duration-300 hover:scale-105 group">
              <span className="relative">
                {coloredSubtitle.map((char, index) =>
                  char.letter === " " ? (
                    <span
                      key={index}
                      className="inline-block transition-all duration-300 select-none"
                      style={{
                        width: "0.3em",
                      }}
                    >
                      &nbsp;
                    </span>
                  ) : (
                    <ColorTooltip
                      key={index}
                      colorValue={char.color}
                      showCopyIcon={false}
                    >
                      <span
                        className="inline-block transition-all duration-300 cursor-pointer select-none"
                        style={{
                          color: char.color,
                          textShadow: "0 0 10px rgba(0,0,0,0.1)",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={t("copyColorLabel", { color: char.color })}
                      >
                        {char.letter}
                      </span>
                    </ColorTooltip>
                  )
                )}
                <Tooltip open={true}>
                  <TooltipTrigger asChild>
                    <RefreshCw
                      className="inline-block ml-2 h-5 w-5 cursor-pointer"
                      onClick={regenerate}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    className="rotate-10"
                    side="top"
                    align="start"
                    sideOffset={4}
                  >
                    <p className="text-xs text-center font-semibold">
                      {t("refreshTooltip")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </span>
            </span>
          </h1>

          {/* Description */}
          <p className="hidden md:block text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            {t("description")}
          </p>

          {/* CTA Button with CoolMode particle effects */}
          <CoolMode>
            <Button
              size="lg"
              className="mt-4 md:mt-0 font-semibold px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                // Smooth scroll to the generator section
                const generatorSection =
                  document.querySelector("[data-generator]");
                generatorSection?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              {t("cta")}
              <Palette className="ml-2 h-5 w-5" />
            </Button>
          </CoolMode>
        </div>

        {/* Features grid displaying product capabilities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl p-4 md:p-6 text-center hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-all duration-300 shadow-md hover:rotate-3 hover:scale-105 relative"
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full shadow-sm mb-3 md:mb-4 transition-shadow duration-300"
                  style={{
                    background: `${feature.bgColor}`,
                  }}
                >
                  <IconComponent
                    className="h-6 w-6 md:h-8 md:w-8 transition-colors duration-300"
                    style={{ color: feature.iconColor }}
                    strokeWidth={2}
                  />
                </div>
                {feature.isComingSoon && (
                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 text-xs px-2 py-0.5 font-medium z-10"
                    style={{
                      backgroundColor: isDarkTheme
                        ? lightColors[0]
                        : darkColors[1],
                      color: isDarkTheme ? darkColors[0] : lightColors[0],
                      borderColor: isDarkTheme ? lightColors[1] : darkColors[2],
                    }}
                  >
                    {t("features.comingSoon")}
                  </Badge>
                )}

                <div className="text-center">
                  <p className="text-sm md:text-base font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-300 mb-1">
                    {feature.text}
                  </p>
                  <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400 leading-tight">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decorative background elements with animated blur effects */}
        <div
          className="hidden md:block absolute top-1/4 -left-4 w-24 h-24 rounded-full blur-2xl animate-pulse"
          style={{
            backgroundColor: isDarkTheme ? lightColors[2] : darkColors[1],
          }}
        />
        <div
          className="hidden md:block absolute top-3/4 -right-4 w-32 h-32 rounded-full blur-2xl animate-pulse delay-1000"
          style={{
            backgroundColor: isDarkTheme ? lightColors[1] : darkColors[1],
          }}
        />
      </div>
    </section>
  );
};

export default Hero;
