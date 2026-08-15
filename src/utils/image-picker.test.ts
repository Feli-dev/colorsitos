import { describe, expect, it } from "vitest";

import { placeMagnifier, toSourcePixel } from "./image-picker";

const geometry = {
  displayed: { width: 400, height: 300 },
  natural: { width: 1200, height: 900 },
};

describe("toSourcePixel", () => {
  it("scales a displayed position onto the source", () => {
    // The image renders at a third of its intrinsic size.
    expect(toSourcePixel({ x: 100, y: 50 }, geometry)).toEqual({
      x: 300,
      y: 150,
    });
  });

  it("maps the top-left corner to the first pixel", () => {
    expect(toSourcePixel({ x: 0, y: 0 }, geometry)).toEqual({ x: 0, y: 0 });
  });

  it("is the identity when the image renders at its natural size", () => {
    const oneToOne = {
      displayed: { width: 800, height: 600 },
      natural: { width: 800, height: 600 },
    };

    expect(toSourcePixel({ x: 123, y: 456 }, oneToOne)).toEqual({
      x: 123,
      y: 456,
    });
  });

  it("handles non-uniform scaling on each axis independently", () => {
    const squashed = {
      displayed: { width: 100, height: 300 },
      natural: { width: 400, height: 300 },
    };

    expect(toSourcePixel({ x: 50, y: 150 }, squashed)).toEqual({
      x: 200,
      y: 150,
    });
  });

  it("returns null past the right or bottom edge", () => {
    // Rather than clamping — a clamped edge pixel would be reported as a real
    // sample from wherever the pointer actually was.
    expect(toSourcePixel({ x: 400, y: 10 }, geometry)).toBeNull();
    expect(toSourcePixel({ x: 10, y: 300 }, geometry)).toBeNull();
  });

  it("returns null for negative positions", () => {
    expect(toSourcePixel({ x: -1, y: 10 }, geometry)).toBeNull();
    expect(toSourcePixel({ x: 10, y: -1 }, geometry)).toBeNull();
  });

  it("accepts the last pixel but not one past it", () => {
    expect(toSourcePixel({ x: 399.9, y: 299.9 }, geometry)).not.toBeNull();
    expect(toSourcePixel({ x: 400.1, y: 299.9 }, geometry)).toBeNull();
  });

  it("returns null instead of dividing by zero before layout", () => {
    const unlaidOut = {
      displayed: { width: 0, height: 0 },
      natural: { width: 100, height: 100 },
    };

    expect(toSourcePixel({ x: 0, y: 0 }, unlaidOut)).toBeNull();
  });
});

describe("placeMagnifier", () => {
  const displayed = { width: 400, height: 300 };

  it("centres on the pointer when there is room", () => {
    const { position, size } = placeMagnifier({ x: 200, y: 150 }, displayed);

    expect(size).toBe(150);
    expect(position).toEqual({ x: 200 - 75, y: 150 - 75 });
  });

  it("clamps to the top-left rather than hanging off the image", () => {
    expect(placeMagnifier({ x: 0, y: 0 }, displayed).position).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("clamps to the bottom-right", () => {
    const { position, size } = placeMagnifier({ x: 400, y: 300 }, displayed);

    expect(position).toEqual({
      x: displayed.width - size,
      y: displayed.height - size,
    });
  });

  it("sits above the pointer on touch, where a finger would cover it", () => {
    const touch = placeMagnifier({ x: 200, y: 250 }, displayed, {
      isTouch: true,
    });

    expect(touch.size).toBe(100);
    expect(touch.position.y).toBe(250 - 100 - 20);
    expect(touch.position.y).toBeLessThan(250);
  });

  it("keeps the zoomed region aligned with the pointer even when clamped", () => {
    // The background offset is computed from the pointer, not from the clamped
    // box — otherwise the magnified content would slide away from what is
    // under the cursor at the edges.
    const centre = placeMagnifier({ x: 200, y: 150 }, displayed);
    const corner = placeMagnifier({ x: 5, y: 5 }, displayed);

    expect(centre.backgroundPosition).toEqual({
      x: -200 * 3 + 75,
      y: -150 * 3 + 75,
    });
    expect(corner.backgroundPosition).toEqual({
      x: -5 * 3 + 75,
      y: -5 * 3 + 75,
    });
  });

  it("scales the background by the zoom factor", () => {
    const { backgroundSize } = placeMagnifier({ x: 10, y: 10 }, displayed, {
      zoom: 4,
    });

    expect(backgroundSize).toEqual({ width: 1600, height: 1200 });
  });

  it("honours an explicit size over the touch default", () => {
    const { size } = placeMagnifier({ x: 10, y: 10 }, displayed, {
      isTouch: true,
      size: 220,
    });

    expect(size).toBe(220);
  });
});
