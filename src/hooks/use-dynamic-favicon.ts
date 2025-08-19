"use client";

import { generateRandomColor } from "@/utils/color-utils";
import { useEffect, useRef } from "react";

/**
 * Hook to generate a dynamic favicon with a random color
 */
export function useDynamicFavicon() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Generates a favicon using canvas with the specified color
   */
  const generateFavicon = (
    color: string,
    shape: "circle" | "square" = "square"
  ): string => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 32;
      canvasRef.current.height = 32;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    // Clean the canvas
    ctx.clearRect(0, 0, 32, 32);

    // Create the shape with the specified color
    ctx.fillStyle = color;

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Square with rounded corners
      ctx.beginPath();
      ctx.roundRect(4, 4, 24, 24, 4);
      ctx.fill();
    }

    // Add a subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Convert to data URL
    return canvas.toDataURL("image/png");
  };

  /**
   * Updates the favicon in the DOM
   */
  const updateFavicon = (dataUrl: string) => {
    // Find the existing favicon link element
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

    if (!favicon) {
      // If it doesn't exist, create a new one
      favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      document.head.appendChild(favicon);
    }

    favicon.href = dataUrl;
  };

  /**
   * Generates and sets a favicon with a random color
   */
  const setRandomFavicon = (shape: "circle" | "square" = "square") => {
    const randomColor = generateRandomColor();
    const faviconDataUrl = generateFavicon(randomColor, shape);
    updateFavicon(faviconDataUrl);
    return randomColor;
  };

  /**
   * Generates and sets a favicon with a specific color
   */
  const setColorFavicon = (
    color: string,
    shape: "circle" | "square" = "square"
  ) => {
    const faviconDataUrl = generateFavicon(color, shape);
    updateFavicon(faviconDataUrl);
  };

  return {
    setRandomFavicon,
    setColorFavicon,
    generateFavicon,
  };
}

/**
 * Hook that automatically sets a random favicon when the component is mounted
 */
export function useAutoRandomFavicon() {
  const { setRandomFavicon } = useDynamicFavicon();

  useEffect(() => {
    // Set random favicon when loading
    setRandomFavicon();

    // Optional: change the favicon every 30 seconds
    // const interval = setInterval(() => {
    //   setRandomFavicon();
    // }, 30000);

    // return () => clearInterval(interval);

    return () => {
      // Cleanup if necessary
    };
  }, [setRandomFavicon]);

  return { setRandomFavicon };
}
