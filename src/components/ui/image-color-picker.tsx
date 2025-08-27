"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, ImageIcon, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

export interface ImageColorPickerProps {
  children?: React.ReactNode;
  onColorSelect?: (color: string) => void;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialImage?: string;
}

export const ImageColorPicker = forwardRef<
  HTMLButtonElement,
  ImageColorPickerProps
>(
  (
    {
      children,
      onColorSelect,
      title = "Image Color Picker",
      open: controlledOpen,
      onOpenChange: controlledOnOpenChange,
      initialImage,
    },
    ref
  ) => {
    const t = useTranslations();
    const [internalOpen, setInternalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(
      initialImage || null
    );
    const [isDragActive, setIsDragActive] = useState(false);

    // Color selection states
    const [isSelecting, setIsSelecting] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);

    // Use controlled or uncontrolled state
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = controlledOnOpenChange || setInternalOpen;

    // Process selected file
    const handleFileSelect = useCallback((file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }, []);

    // Handle paste from clipboard
    const handlePaste = useCallback(
      (e: ClipboardEvent) => {
        const items = Array.from(e.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));

        if (imageItem) {
          e.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            handleFileSelect(file);
          }
        }
      },
      [handleFileSelect]
    );

    // Listen for paste events when modal is open
    useEffect(() => {
      if (isOpen) {
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
      }
    }, [isOpen, handlePaste]);

    // Update selected image when initialImage changes
    useEffect(() => {
      if (initialImage) {
        setSelectedImage(initialImage);
      }
    }, [initialImage]);

    // Detect mobile device
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Handle file drop
    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith("image/"));

        if (imageFile) {
          handleFileSelect(imageFile);
        }
      },
      [handleFileSelect]
    );

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    // Extract color from image at specific coordinates
    const extractColorAtPosition = useCallback(
      (x: number, y: number): string | null => {
        const img = imageRef.current;
        const canvas = canvasRef.current;

        if (!img || !canvas) return null;

        const rect = img.getBoundingClientRect();

        // Scale coordinates to match actual image dimensions
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        const actualX = x * scaleX;
        const actualY = y * scaleY;

        // Ensure coordinates are within bounds
        if (
          actualX < 0 ||
          actualY < 0 ||
          actualX >= img.naturalWidth ||
          actualY >= img.naturalHeight
        ) {
          return null;
        }

        // Draw image to canvas and extract pixel color
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const pixelData = ctx.getImageData(actualX, actualY, 1, 1).data;
        const hex = `#${[pixelData[0], pixelData[1], pixelData[2]]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`;

        return hex;
      },
      []
    );

    // Update color from cursor position (simplified approach)
    const updateColorFromCursor = useCallback(
      (cursorX: number, cursorY: number) => {
        // Extract color directly from the cursor position
        const color = extractColorAtPosition(cursorX, cursorY);
        if (color) {
          setSelectedColor(color);
          setSelectedPosition({ x: cursorX, y: cursorY });
        }
      },
      [extractColorAtPosition]
    );

    // Handle mouse/touch start
    const handlePointerStart = (
      e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>
    ) => {
      e.preventDefault();
      const img = imageRef.current;
      if (!img) return;

      setIsSelecting(true);

      const rect = img.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setCursorPosition({ x, y });

      // Extract color directly from cursor position
      updateColorFromCursor(x, y);
    };

    // Handle mouse/touch move
    const handlePointerMove = (
      e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>
    ) => {
      if (!isSelecting) return;

      e.preventDefault();
      const img = imageRef.current;
      if (!img) return;

      const rect = img.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setCursorPosition({ x, y });

      // Extract color directly from cursor position
      updateColorFromCursor(x, y);
    };

    // Handle mouse/touch end
    const handlePointerEnd = () => {
      setIsSelecting(false);
      setCursorPosition(null);
    };

    // Confirm color selection
    const handleConfirmColor = () => {
      if (selectedColor) {
        onColorSelect?.(selectedColor);
        setIsOpen(false);
        resetState();
      }
    };

    // Reset component state
    const resetState = () => {
      setSelectedImage(null);
      setIsSelecting(false);
      setCursorPosition(null);
      setSelectedColor(null);
      setSelectedPosition(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        resetState();
      }
      setIsOpen(open);
    };

    const handleClearImage = () => {
      resetState();
    };

    const handleSelectFile = () => {
      fileInputRef.current?.click();
    };

    // Create magnifier component (simplified based on DEV.to article)
    const renderMagnifier = () => {
      if (!cursorPosition || !selectedImage || !imageRef.current) return null;

      const img = imageRef.current;
      const rect = img.getBoundingClientRect();
      const magnifierSize = isMobile ? 100 : 150;
      const zoomLevel = 3;
      const { x, y } = cursorPosition;

      // Calculate magnifier position
      let magnifierX = x - magnifierSize / 2;
      let magnifierY = y - magnifierSize / 2;

      // Adjust position for mobile (above finger)
      if (isMobile) {
        magnifierY = y - magnifierSize - 20;
      }

      // Keep magnifier within image bounds
      magnifierX = Math.max(
        0,
        Math.min(magnifierX, rect.width - magnifierSize)
      );
      magnifierY = Math.max(
        0,
        Math.min(magnifierY, rect.height - magnifierSize)
      );

      // Calculate background position (simplified approach from article)
      const backgroundPositionX = -x * zoomLevel + magnifierSize / 2;
      const backgroundPositionY = -y * zoomLevel + magnifierSize / 2;
      const backgroundSizeX = rect.width * zoomLevel;
      const backgroundSizeY = rect.height * zoomLevel;

      return (
        <div
          className="absolute border-2 border-white shadow-lg rounded-full overflow-hidden pointer-events-none z-10"
          style={{
            left: magnifierX,
            top: magnifierY,
            width: magnifierSize,
            height: magnifierSize,
            backgroundImage: `url(${selectedImage})`,
            backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
            backgroundSize: `${backgroundSizeX}px ${backgroundSizeY}px`,
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Smaller crosshair in the center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 border-2 border-gray-800 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      );
    };

    // Create color indicator circle (smaller and cleaner)
    const renderColorIndicator = () => {
      if (!selectedPosition || !imageRef.current) return null;

      return (
        <div
          className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none shadow-lg z-10"
          style={{
            left: selectedPosition.x - 6,
            top: selectedPosition.y - 6,
            backgroundColor: selectedColor || "transparent",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      );
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild ref={ref}>
          {children || (
            <Button type="button" variant="ghost" size="icon">
              <ImageIcon className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] md:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {!selectedImage ? (
              <div
                className={cn(
                  "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors",
                  isDragActive && "border-primary bg-primary/5"
                )}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
              >
                <div className="flex flex-col items-center gap-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {t("generator.imagePicker.dropZone.title")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("generator.imagePicker.dropZone.subtitle")}
                    </p>
                    <p className="text-xs text-muted-foreground/75">
                      {t("generator.imagePicker.dropZone.pasteHint")}
                    </p>
                  </div>
                  <Button type="button" onClick={handleSelectFile}>
                    {t("generator.imagePicker.selectFile")}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("generator.imagePicker.clickToSelect")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearImage}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("generator.imagePicker.clear")}
                  </Button>
                </div>

                <div className="flex-1 overflow-hidden rounded-lg border">
                  <div className="relative h-full overflow-auto">
                    <img
                      ref={imageRef}
                      src={selectedImage}
                      alt="Color picker source"
                      className="w-full h-auto cursor-crosshair"
                      onMouseDown={handlePointerStart}
                      onMouseMove={handlePointerMove}
                      onMouseUp={handlePointerEnd}
                      onMouseLeave={handlePointerEnd}
                      onTouchStart={handlePointerStart}
                      onTouchMove={handlePointerMove}
                      onTouchEnd={handlePointerEnd}
                      style={{ touchAction: "none" }}
                    />
                    {renderColorIndicator()}
                    {renderMagnifier()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color confirmation panel */}
          {selectedColor && selectedPosition && (
            <div className="flex-shrink-0 border-t p-4 bg-muted/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border border-muted-foreground/20"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="text-sm">
                    <div className="font-medium">
                      {selectedColor.toUpperCase()}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t("generator.imagePicker.selectedColor")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedColor(null);
                      setSelectedPosition(null);
                    }}
                  >
                    {t("generator.imagePicker.cancel")}
                  </Button>
                  <Button type="button" size="sm" onClick={handleConfirmColor}>
                    <Check className="h-4 w-4 mr-2" />
                    {t("generator.imagePicker.confirm")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for color extraction */}
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={magnifierCanvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    );
  }
);

ImageColorPicker.displayName = "ImageColorPicker";
