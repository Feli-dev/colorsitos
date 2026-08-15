import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ImageColorPicker } from "./image-color-picker";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function imageFile(name = "swatch.png", type = "image/png") {
  return new File(["PNG"], name, { type });
}

/**
 * jsdom's FileReader works, but not on a File built from a plain string, so
 * the read is stubbed to resolve at a known data URL. What is under test is the
 * wiring — drop and paste both reach the reader and the result becomes the
 * picked image — not FileReader itself.
 */
function stubFileReader(result = PNG) {
  const readAsDataURL = vi.fn(function (this: FileReader) {
    Object.defineProperty(this, "result", { value: result, configurable: true });
    this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
  });
  vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(
    readAsDataURL
  );
  return readAsDataURL;
}

const dropZone = () => screen.getByText("generator.imagePicker.dropZone.title");

const pickedImage = () => screen.queryByAltText("Color picker source");

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ImageColorPicker ingestion", () => {
  it("opens on the drop zone, with no image yet", async () => {
    render(<ImageColorPicker open onOpenChange={vi.fn()} />);

    expect(dropZone()).toBeInTheDocument();
    expect(pickedImage()).not.toBeInTheDocument();
  });

  it("accepts an image dropped onto the zone", async () => {
    const read = stubFileReader();
    render(<ImageColorPicker open onOpenChange={vi.fn()} />);

    fireEvent.drop(dropZone().closest("div")!.parentElement!, {
      dataTransfer: { files: [imageFile()] },
    });

    await waitFor(() => expect(pickedImage()).toBeInTheDocument());
    expect(read).toHaveBeenCalledTimes(1);
  });

  it("ignores a dropped file that is not an image", async () => {
    const read = stubFileReader();
    render(<ImageColorPicker open onOpenChange={vi.fn()} />);

    fireEvent.drop(dropZone().closest("div")!.parentElement!, {
      dataTransfer: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] },
    });

    // Silently doing nothing is the intended behaviour; the drop zone stays.
    expect(read).not.toHaveBeenCalled();
    expect(dropZone()).toBeInTheDocument();
  });

  it("picks the image out of a mixed-file drop", async () => {
    stubFileReader();
    render(<ImageColorPicker open onOpenChange={vi.fn()} />);

    fireEvent.drop(dropZone().closest("div")!.parentElement!, {
      dataTransfer: {
        files: [
          new File(["x"], "notes.txt", { type: "text/plain" }),
          imageFile("photo.jpg", "image/jpeg"),
        ],
      },
    });

    await waitFor(() => expect(pickedImage()).toBeInTheDocument());
  });

  it("accepts an image pasted from the clipboard", async () => {
    const read = stubFileReader();
    render(<ImageColorPicker open onOpenChange={vi.fn()} />);

    const file = imageFile();
    fireEvent.paste(document, {
      clipboardData: {
        items: [{ type: "image/png", getAsFile: () => file }],
      },
    });

    await waitFor(() => expect(pickedImage()).toBeInTheDocument());
    expect(read).toHaveBeenCalledWith(file);
  });

  it("leaves pasted text alone", async () => {
    const read = stubFileReader();
    render(<ImageColorPicker open onOpenChange={vi.fn()} />);

    fireEvent.paste(document, {
      clipboardData: {
        items: [{ type: "text/plain", getAsFile: () => null }],
      },
    });

    expect(read).not.toHaveBeenCalled();
    expect(dropZone()).toBeInTheDocument();
  });

  it("stops listening for pastes once closed", async () => {
    const read = stubFileReader();
    const { rerender } = render(
      <ImageColorPicker open onOpenChange={vi.fn()} />
    );

    rerender(<ImageColorPicker open={false} onOpenChange={vi.fn()} />);

    fireEvent.paste(document, {
      clipboardData: {
        items: [{ type: "image/png", getAsFile: () => imageFile() }],
      },
    });

    // A leaked document listener would swallow every paste on the page,
    // long after the dialog is gone.
    expect(read).not.toHaveBeenCalled();
  });

  it("takes an image handed in as a prop", async () => {
    render(<ImageColorPicker open onOpenChange={vi.fn()} initialImage={PNG} />);

    expect(pickedImage()).toBeInTheDocument();
    expect(pickedImage()).toHaveAttribute("src", PNG);
  });

  it("returns to the drop zone when the image is cleared", async () => {
    render(<ImageColorPicker open onOpenChange={vi.fn()} initialImage={PNG} />);

    await userEvent.click(screen.getByText("generator.imagePicker.clear"));

    await waitFor(() => expect(dropZone()).toBeInTheDocument());
    expect(pickedImage()).not.toBeInTheDocument();
  });
});
