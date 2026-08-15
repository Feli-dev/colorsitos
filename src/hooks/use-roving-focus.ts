"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";

/**
 * Roving tabindex for a group of related controls.
 *
 * A set of sibling buttons that each take a tab stop turns navigation into a
 * chore: twenty coloured letters in a headline cost twenty presses to get past.
 * The convention is to make the group a single tab stop and move within it
 * using the arrow keys, which is what this implements.
 *
 * Exactly one item is tabbable at a time — the one that would receive focus on
 * entry — and the rest are reachable but skipped by Tab.
 */
export function useRovingFocus(count: number) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const items = useRef<(HTMLElement | null)[]>([]);

  // If the collection shrinks, the remembered index can point past the end.
  const activeIndex = count > 0 ? Math.min(focusedIndex, count - 1) : 0;

  const move = useCallback(
    (to: number) => {
      if (count === 0) return;

      // Wraps in both directions, so End then Right returns to the start.
      const next = ((to % count) + count) % count;
      setFocusedIndex(next);
      items.current[next]?.focus();
    },
    [count]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          move(activeIndex + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          move(activeIndex - 1);
          break;
        case "Home":
          event.preventDefault();
          move(0);
          break;
        case "End":
          event.preventDefault();
          move(count - 1);
          break;
        default:
          // Enter and Space belong to the item, not the group.
          break;
      }
    },
    [activeIndex, count, move]
  );

  /** Props for the item at `index`. Spread onto each member of the group. */
  const itemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      ref: (element: HTMLElement | null) => {
        items.current[index] = element;
      },
      // Keeps the group in step when focus arrives by click or by screen reader
      // navigation rather than through the arrow keys.
      onFocus: () => setFocusedIndex(index),
    }),
    [activeIndex]
  );

  return { onKeyDown, itemProps, activeIndex };
}
