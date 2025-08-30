"use client";

import React, { ReactNode, useEffect, useRef } from "react";

/**
 * Base interface for particle objects used in particle effects.
 * Defines the core properties needed for positioning and rendering particles.
 */
export interface BaseParticle {
  /** The DOM element representing the particle */
  element: HTMLElement | SVGSVGElement;
  /** Horizontal position of the particle */
  left: number;
  /** Size of the particle in pixels */
  size: number;
  /** Vertical position of the particle */
  top: number;
}

/**
 * Options for configuring base particle behavior.
 * Provides customization for particle appearance and size.
 */
export interface BaseParticleOptions {
  /** Type of particle to render ('square', 'circle', emoji, or image URL) */
  particle?: string;
  /** Size of particles in pixels */
  size?: number;
}

/**
 * Extended particle interface with movement and animation properties.
 * Includes physics properties for realistic particle motion and rotation.
 */
export interface CoolParticle extends BaseParticle {
  /** Direction of horizontal movement (-1 for left, 1 for right) */
  direction: number;
  /** Horizontal movement speed */
  speedHorz: number;
  /** Vertical movement speed (upward) */
  speedUp: number;
  /** Rotation speed in degrees per frame */
  spinSpeed: number;
  /** Current rotation value in degrees */
  spinVal: number;
}

/**
 * Options for configuring cool particle effects with advanced physics.
 * Extends base options with movement and count controls.
 */
export interface CoolParticleOptions extends BaseParticleOptions {
  /** Maximum number of particles to display simultaneously */
  particleCount?: number;
  /** Horizontal movement speed multiplier */
  speedHorz?: number;
  /** Vertical movement speed multiplier */
  speedUp?: number;
}

/**
 * Gets or creates a container element for particle effects.
 * Uses a singleton pattern to ensure only one container exists per page.
 * The container is positioned fixed and covers the entire viewport.
 *
 * @returns The container DOM element for particle effects
 */
const getContainer = () => {
  const id = "_coolMode_effect";
  // eslint-disable-next-line prefer-const
  let existingContainer = document.getElementById(id);

  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement("div");
  container.setAttribute("id", id);
  container.setAttribute(
    "style",
    "overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:2147483647"
  );

  document.body.appendChild(container);

  return container;
};

let instanceCounter = 0;

/**
 * Applies particle effects to a DOM element with mouse/touch interaction.
 * Creates animated particles that follow mouse movement and respond to user interaction.
 * Supports different particle types including squares, emojis, and images.
 *
 * @param element - The DOM element to attach particle effects to
 * @param options - Configuration options for particle behavior and appearance
 * @returns Cleanup function to remove event listeners and stop animation
 */
const applyParticleEffect = (
  element: HTMLElement,
  options?: CoolParticleOptions
): (() => void) => {
  instanceCounter++;

  const defaultParticle = "square";
  const particleType = options?.particle || defaultParticle;
  const sizes = [15, 20, 25, 35, 45];
  const limit = 45;

  let particles: CoolParticle[] = [];
  let autoAddParticle = false;
  let mouseX = 0;
  let mouseY = 0;

  const container = getContainer();

  /**
   * Generates a new particle with random properties and adds it to the animation.
   * Creates different types of particles based on the particleType option.
   * Particles are positioned relative to current mouse/touch position.
   */
  function generateParticle() {
    const size =
      options?.size || sizes[Math.floor(Math.random() * sizes.length)];
    const speedHorz = options?.speedHorz || Math.random() * 10;
    const speedUp = options?.speedUp || Math.random() * 25;
    const spinVal = Math.random() * 360;
    const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1);
    const top = mouseY - size / 2;
    const left = mouseX - size / 2;
    const direction = Math.random() <= 0.5 ? -1 : 1;

    const particle = document.createElement("div");

    // Render a square with rounded corners using SVG <rect>
    if (particleType === "square") {
      const svgNS = "http://www.w3.org/2000/svg";
      const squareSVG = document.createElementNS(svgNS, "svg");
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttributeNS(null, "x", "0");
      rect.setAttributeNS(null, "y", "0");
      rect.setAttributeNS(null, "width", size.toString());
      rect.setAttributeNS(null, "height", size.toString());
      rect.setAttributeNS(null, "rx", (size * 0.25).toString()); // Rounded corners (35% of size)
      rect.setAttributeNS(null, "ry", (size * 0.25).toString());
      rect.setAttributeNS(
        null,
        "fill",
        `hsl(${Math.random() * 360}, 70%, 50%)`
      );

      squareSVG.appendChild(rect);
      squareSVG.setAttribute("width", size.toString());
      squareSVG.setAttribute("height", size.toString());

      particle.appendChild(squareSVG);
    } else if (
      particleType.startsWith("http") ||
      particleType.startsWith("/")
    ) {
      // Handle URL-based images
      particle.innerHTML = `<img src="${particleType}" width="${size}" height="${size}" style="border-radius: 50%">`;
    } else {
      // Handle emoji or text characters
      const fontSizeMultiplier = 3; // Make emojis 3x bigger
      const emojiSize = size * fontSizeMultiplier;
      particle.innerHTML = `<div style="font-size: ${emojiSize}px; line-height: 1; text-align: center; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; transform: scale(${fontSizeMultiplier}); transform-origin: center;">${particleType}</div>`;
    }

    particle.style.position = "absolute";
    particle.style.transform = `translate3d(${left}px, ${top}px, 0px) rotate(${spinVal}deg)`;

    container.appendChild(particle);

    particles.push({
      direction,
      element: particle,
      left,
      size,
      speedHorz,
      speedUp,
      spinSpeed,
      spinVal,
      top,
    });
  }

  /**
   * Updates the position and properties of all active particles.
   * Handles particle movement, rotation, fading, and cleanup when particles go off-screen.
   * Uses requestAnimationFrame for smooth 60fps animation.
   */
  function refreshParticles() {
    particles.forEach((p) => {
      p.left = p.left - p.speedHorz * p.direction;
      p.top = p.top - p.speedUp;
      p.speedUp = Math.min(p.size, p.speedUp - 1);
      p.spinVal = p.spinVal + p.spinSpeed;

      if (
        p.top >=
        Math.max(window.innerHeight, document.body.clientHeight) + p.size
      ) {
        particles = particles.filter((o) => o !== p);
        p.element.remove();
      }

      p.element.setAttribute(
        "style",
        [
          "position:absolute",
          "will-change:transform",
          `top:${p.top}px`,
          `left:${p.left}px`,
          `transform:rotate(${p.spinVal}deg)`,
        ].join(";")
      );
    });
  }

  let animationFrame: number | undefined;

  let lastParticleTimestamp = 0;
  const particleGenerationDelay = 30;

  /**
   * Main animation loop that runs continuously using requestAnimationFrame.
   * Manages particle generation timing, updates particle positions, and handles cleanup.
   * Automatically stops when no particles remain and no instances are active.
   */
  function loop() {
    const currentTime = performance.now();
    if (
      autoAddParticle &&
      particles.length < limit &&
      currentTime - lastParticleTimestamp > particleGenerationDelay
    ) {
      generateParticle();
      lastParticleTimestamp = currentTime;
    }

    refreshParticles();
    animationFrame = requestAnimationFrame(loop);
  }

  loop();

  const isTouchInteraction = "ontouchstart" in window;

  const tap = isTouchInteraction ? "touchstart" : "mousedown";
  const tapEnd = isTouchInteraction ? "touchend" : "mouseup";
  const move = isTouchInteraction ? "touchmove" : "mousemove";

  /**
   * Updates the current mouse/touch position for particle generation.
   * Handles both mouse and touch events to ensure cross-platform compatibility.
   * @param e - Mouse or touch event containing position data
   */
  const updateMousePosition = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      mouseX = e.touches?.[0].clientX;
      mouseY = e.touches?.[0].clientY;
    } else {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  };

  /**
   * Handles tap/press events to start particle generation.
   * Updates mouse position and enables automatic particle creation.
   * @param e - Mouse or touch event triggering particle generation
   */
  const tapHandler = (e: MouseEvent | TouchEvent) => {
    updateMousePosition(e);
    autoAddParticle = true;
  };

  /**
   * Disables automatic particle generation.
   * Called when user releases touch or moves mouse away from element.
   */
  const disableAutoAddParticle = () => {
    autoAddParticle = false;
  };

  element.addEventListener(move, updateMousePosition, { passive: true });
  element.addEventListener(tap, tapHandler, { passive: true });
  element.addEventListener(tapEnd, disableAutoAddParticle, { passive: true });
  element.addEventListener("mouseleave", disableAutoAddParticle, {
    passive: true,
  });

  return () => {
    element.removeEventListener(move, updateMousePosition);
    element.removeEventListener(tap, tapHandler);
    element.removeEventListener(tapEnd, disableAutoAddParticle);
    element.removeEventListener("mouseleave", disableAutoAddParticle);

    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame);
        clearInterval(interval);

        if (--instanceCounter === 0) {
          container.remove();
        }
      }
    }, 500);
  };
};

/**
 * Props for the CoolMode component.
 * Defines the children to wrap and optional particle configuration.
 */
interface CoolModeProps {
  /** Child components to apply particle effects to */
  children: ReactNode;
  /** Optional configuration for particle behavior and appearance */
  options?: CoolParticleOptions;
}

/**
 * CoolMode component that adds interactive particle effects to child elements.
 * Creates animated particles that respond to mouse/touch interactions.
 * Supports various particle types and customizable physics properties.
 *
 * @param props - Component props
 * @param props.children - Child elements to apply effects to
 * @param props.options - Optional particle configuration
 * @returns Wrapped children with particle effects applied
 *
 * @example
 * ```tsx
 * <CoolMode options={{ particle: "✨", size: 20 }}>
 *   <button>Click me!</button>
 * </CoolMode>
 * ```
 */
export const CoolMode: React.FC<CoolModeProps> = ({ children, options }) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      return applyParticleEffect(ref.current, options);
    }
  }, [options]);

  return React.cloneElement(children as React.ReactElement, { ref });
};
