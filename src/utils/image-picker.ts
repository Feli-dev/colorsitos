/**
 * Geometry for picking a colour out of a displayed image.
 *
 * These are the parts of the image colour picker that are pure arithmetic:
 * mapping a pointer position onto a source pixel, and placing the magnifier.
 * They lived inside the component, where nothing could reach them.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageGeometry {
  /** Size the image is rendered at, from getBoundingClientRect. */
  displayed: Size;
  /** The image's intrinsic size, from naturalWidth / naturalHeight. */
  natural: Size;
}

/**
 * Maps a position within the displayed image onto a pixel of the source.
 *
 * Returns null when the position falls outside the image, so a pointer that
 * has left the element cannot read a clamped edge pixel and pass it off as a
 * real sample.
 */
export function toSourcePixel(
  point: Point,
  { displayed, natural }: ImageGeometry
): Point | null {
  if (displayed.width <= 0 || displayed.height <= 0) return null;

  const x = point.x * (natural.width / displayed.width);
  const y = point.y * (natural.height / displayed.height);

  if (x < 0 || y < 0 || x >= natural.width || y >= natural.height) return null;

  return { x, y };
}

export interface MagnifierPlacement {
  /** Top-left of the magnifier, clamped inside the image. */
  position: Point;
  /** Background offset that centres the zoomed region under the pointer. */
  backgroundPosition: Point;
  backgroundSize: Size;
  size: number;
}

/**
 * Places the magnifier for a pointer position.
 *
 * On touch it sits above the finger rather than under it, since a finger
 * covers the thing it is pointing at. It is then clamped so it never hangs off
 * the image, which is why the offset is computed before the clamp and the
 * background offset after — clamping first would slide the zoomed region out
 * of alignment with the pointer.
 */
export function placeMagnifier(
  pointer: Point,
  displayed: Size,
  options: { isTouch?: boolean; size?: number; zoom?: number } = {}
): MagnifierPlacement {
  const { isTouch = false, size = isTouch ? 100 : 150, zoom = 3 } = options;

  const rawX = pointer.x - size / 2;
  const rawY = isTouch ? pointer.y - size - 20 : pointer.y - size / 2;

  return {
    size,
    position: {
      x: Math.max(0, Math.min(rawX, displayed.width - size)),
      y: Math.max(0, Math.min(rawY, displayed.height - size)),
    },
    backgroundPosition: {
      x: -pointer.x * zoom + size / 2,
      y: -pointer.y * zoom + size / 2,
    },
    backgroundSize: {
      width: displayed.width * zoom,
      height: displayed.height * zoom,
    },
  };
}
