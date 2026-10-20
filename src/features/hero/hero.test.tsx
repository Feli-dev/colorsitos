import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Hero from "./hero";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("Hero", () => {
  // jsdom has no layout engine, so scrollWidth cannot be measured here; the
  // regression is pinned structurally instead. The decorative blobs sit at
  // -right-4, so the section that contains them has to clip the overflow.
  it("clips horizontal overflow from the decorative blobs inside the section", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section")!;
    const blobs = container.querySelectorAll(".blur-2xl");

    expect(blobs.length).toBeGreaterThan(0);
    expect(section.className).toContain("overflow-x-clip");
    expect(section.className).toContain("relative");
    blobs.forEach((blob) => expect(section.contains(blob)).toBe(true));
  });
});
