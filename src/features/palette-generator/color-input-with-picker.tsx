"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ColorPicker,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/vendor/shadcn-io/color-picker";
import { cn } from "@/lib/utils";
import Color from "color";
import { ImageIcon, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { ImageColorPicker } from "@/features/palette-generator/image-color-picker";

export interface ColorInputWithPickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
  colorPickerTitle?: string;
}

export const ColorInputWithPicker = forwardRef<
  HTMLInputElement,
  ColorInputWithPickerProps
>(
  (
    {
      className,
      onChange,
      value = "",
      colorPickerTitle = "Color Picker",
      ...props
    },
    ref
  ) => {
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [tempColor, setTempColor] = useState(value);
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [pastedImage, setPastedImage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);
    };

    const handleColorPickerChange = (
      colorValue: Parameters<typeof Color.rgb>[0]
    ) => {
      try {
        const color = Color.rgb(colorValue);
        const hexValue = color.hex();
        setTempColor(hexValue);
      } catch (error) {
        console.error("Error converting color:", error);
      }
    };

    const handleColorPickerApply = () => {
      onChange?.(tempColor);
      setIsOpen(false);
    };

    const handleColorPickerCancel = () => {
      setTempColor(value);
      setIsOpen(false);
    };

    // Handle global paste events
    const handleGlobalPaste = useCallback(
      (e: ClipboardEvent) => {
        // Only handle if no input is focused and modals are closed
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA" ||
          activeElement?.hasAttribute("contenteditable");

        if (!isInputFocused && !isOpen && !imagePickerOpen) {
          const items = Array.from(e.clipboardData?.items || []);
          const imageItem = items.find((item) =>
            item.type.startsWith("image/")
          );

          if (imageItem) {
            e.preventDefault();
            const file = imageItem.getAsFile();
            if (file) {
              // Convert file to data URL and open image picker
              const reader = new FileReader();
              reader.onload = (event) => {
                setPastedImage(event.target?.result as string);
                setImagePickerOpen(true);
              };
              reader.readAsDataURL(file);
            }
          }
        }
      },
      [isOpen, imagePickerOpen]
    );

    // Listen for global paste events
    useEffect(() => {
      document.addEventListener("paste", handleGlobalPaste);
      return () => document.removeEventListener("paste", handleGlobalPaste);
    }, [handleGlobalPaste]);

    // Initialize temp color when dialog opens
    const handleOpenChange = (open: boolean) => {
      if (open) {
        setTempColor(value);
      }
      setIsOpen(open);
    };

    // Handle image picker changes
    const handleImagePickerChange = (open: boolean) => {
      if (!open) {
        setPastedImage(null);
      }
      setImagePickerOpen(open);
    };

    return (
      <div className="relative flex">
        <Input
          {...props}
          ref={ref}
          value={value}
          onChange={handleInputChange}
          className={cn("pr-20", className)}
        />
        <ImageColorPicker
          title={t("generator.imagePicker.title")}
          onColorSelect={onChange}
          open={imagePickerOpen}
          onOpenChange={handleImagePickerChange}
          initialImage={pastedImage || undefined}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-10 top-0 h-full w-10 rounded-none hover:bg-muted/50 border-r"
            aria-label="Extract color from image"
          >
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </ImageColorPicker>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10 rounded-l-none hover:bg-muted/50"
              aria-label="Open color picker"
            >
              <Palette className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] md:max-w-md max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{colorPickerTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 space-y-4 overflow-y-auto">
              <ColorPicker
                value={tempColor || "#000000"}
                onChange={handleColorPickerChange}
                className="w-full"
              >
                <div className="h-32 w-full">
                  <ColorPickerSelection />
                </div>
                <div className="flex items-center gap-4">
                  <ColorPickerEyeDropper />
                  <div className="grid w-full gap-1">
                    <ColorPickerHue />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ColorPickerOutput />
                  <ColorPickerFormat />
                </div>
              </ColorPicker>
            </div>
            <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleColorPickerCancel}
              >
                {t("generator.colorPicker.cancel")}
              </Button>
              <Button type="button" onClick={handleColorPickerApply}>
                {t("generator.colorPicker.apply")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

ColorInputWithPicker.displayName = "ColorInputWithPicker";
