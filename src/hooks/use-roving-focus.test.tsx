import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRovingFocus } from "./use-roving-focus";

function Group({ count }: { count: number }) {
  const roving = useRovingFocus(count);

  return (
    <div role="toolbar" onKeyDown={roving.onKeyDown} data-testid="group">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} role="button" aria-label={`item ${i}`} {...roving.itemProps(i)}>
          {i}
        </span>
      ))}
    </div>
  );
}

const item = (i: number) => screen.getByRole("button", { name: `item ${i}` });
const tabbable = () =>
  screen
    .getAllByRole("button")
    .filter((el) => el.getAttribute("tabindex") === "0");

describe("useRovingFocus", () => {
  it("exposes exactly one tab stop for the whole group", () => {
    render(<Group count={5} />);

    // The point of the pattern: five controls, one press to get past them.
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(item(0));
  });

  it("moves forward with ArrowRight", () => {
    render(<Group count={5} />);

    fireEvent.keyDown(screen.getByTestId("group"), { key: "ArrowRight" });

    expect(item(1)).toHaveFocus();
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(item(1));
  });

  it("moves backward with ArrowLeft", () => {
    render(<Group count={5} />);
    const group = screen.getByTestId("group");

    fireEvent.keyDown(group, { key: "ArrowRight" });
    fireEvent.keyDown(group, { key: "ArrowRight" });
    fireEvent.keyDown(group, { key: "ArrowLeft" });

    expect(item(1)).toHaveFocus();
  });

  it("wraps past the end and before the start", () => {
    render(<Group count={3} />);
    const group = screen.getByTestId("group");

    fireEvent.keyDown(group, { key: "End" });
    expect(item(2)).toHaveFocus();

    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(item(0)).toHaveFocus();

    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(item(2)).toHaveFocus();
  });

  it("jumps to the ends with Home and End", () => {
    render(<Group count={5} />);
    const group = screen.getByTestId("group");

    fireEvent.keyDown(group, { key: "End" });
    expect(item(4)).toHaveFocus();

    fireEvent.keyDown(group, { key: "Home" });
    expect(item(0)).toHaveFocus();
  });

  it("treats vertical arrows as equivalent", () => {
    render(<Group count={3} />);
    const group = screen.getByTestId("group");

    fireEvent.keyDown(group, { key: "ArrowDown" });
    expect(item(1)).toHaveFocus();

    fireEvent.keyDown(group, { key: "ArrowUp" });
    expect(item(0)).toHaveFocus();
  });

  it("leaves Enter and Space to the item", () => {
    render(<Group count={3} />);
    const group = screen.getByTestId("group");

    fireEvent.keyDown(group, { key: "ArrowRight" });
    fireEvent.keyDown(group, { key: "Enter" });
    fireEvent.keyDown(group, { key: " " });

    // Activation belongs to the button, so the group must not move focus.
    expect(item(1)).toHaveFocus();
  });

  it("follows focus that arrives by click", () => {
    render(<Group count={5} />);

    fireEvent.focus(item(3));

    expect(tabbable()[0]).toBe(item(3));
  });

  it("does nothing on an empty group", () => {
    render(<Group count={0} />);

    expect(() =>
      fireEvent.keyDown(screen.getByTestId("group"), { key: "ArrowRight" })
    ).not.toThrow();
  });

  it("keeps a valid tab stop when the group shrinks", () => {
    const { rerender } = render(<Group count={5} />);
    fireEvent.keyDown(screen.getByTestId("group"), { key: "End" });
    expect(item(4)).toHaveFocus();

    rerender(<Group count={2} />);

    // The remembered index pointed past the end; it must clamp, not vanish.
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(item(1));
  });
});
