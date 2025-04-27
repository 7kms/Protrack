"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Slider from "@radix-ui/react-slider";

// Predefined common colors (as RGB arrays)
const predefinedColors = [
  [33, 150, 243], // Blue
  [244, 67, 54], // Red
  [76, 175, 80], // Green
  [255, 193, 7], // Amber
  [156, 39, 176], // Purple
  [255, 87, 34], // Deep Orange
  [0, 188, 212], // Cyan
  [255, 255, 255], // White
  [33, 33, 33], // Black
];

function rgbToHslString([r, g, b]: number[]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
    l * 100
  )}%`;
}

const LOCAL_STORAGE_KEY = "protrack-theme-primary-rgb";

export function ThemePanel() {
  // Default: blue
  const [rgb, setRgb] = useState<[number, number, number] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // On mount, load from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          parsed.length === 3 &&
          parsed.every((n) => typeof n === "number")
        ) {
          setRgb(parsed as [number, number, number]);
        } else {
          setRgb([33, 150, 243]); // fallback to blue
        }
      } catch {
        setRgb([33, 150, 243]);
      }
    } else {
      setRgb([33, 150, 243]);
    }
    setIsLoaded(true);
  }, []);

  // On change, update CSS and localStorage
  useEffect(() => {
    if (!isLoaded || !rgb) return;
    const hsl = rgbToHslString(rgb);
    document.documentElement.style.setProperty("--primary", hsl);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rgb));
  }, [rgb, isLoaded]);

  if (!isLoaded || !rgb) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Paintbrush className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Choose a Theme Color
        </h3>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {predefinedColors.map((color, idx) => (
            <button
              key={idx}
              className={cn(
                "rounded-full border-2 w-9 h-9 transition-all duration-150 focus:outline-none",
                rgb.join() === color.join()
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-muted"
              )}
              style={{ backgroundColor: `rgb(${color.join(",")})` }}
              onClick={() => setRgb(color as [number, number, number])}
              aria-label={`Select color rgb(${color.join(",")})`}
            />
          ))}
        </div>
        <div className="mb-4 flex flex-col gap-4">
          {["R", "G", "B"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-4 text-xs font-medium text-right">
                {label}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <Slider.Root
                  className="relative flex items-center w-full h-4 touch-none select-none"
                  value={[rgb[i]]}
                  min={0}
                  max={255}
                  step={1}
                  onValueChange={([v]) =>
                    setRgb(
                      rgb.map((c, idx) => (idx === i ? v : c)) as [
                        number,
                        number,
                        number
                      ]
                    )
                  }
                  aria-label={label}
                >
                  <Slider.Track className="bg-muted-foreground/20 relative grow rounded-full h-1.5">
                    <Slider.Range className="absolute bg-primary rounded-full h-1.5" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full shadow -mt-1 focus:outline-none transition-colors duration-150" />
                </Slider.Root>
                <span className="w-8 text-xs text-right tabular-nums">
                  {rgb[i]}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center mt-4">
          <span className="text-xs mb-1">Preview</span>
          <div
            className="rounded-full border-2 border-primary shadow w-12 h-12"
            style={{ backgroundColor: `rgb(${rgb.join(",")})` }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
