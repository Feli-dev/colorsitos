"use client"

import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme, type ThemeMode } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const icon = resolvedTheme === "dark" ? (
    <MoonIcon className="size-4" />
  ) : (
    <SunIcon className="size-4" />
  );

  return (
    <div className="hidden sm:block">
      <Select value={theme} onValueChange={(v: string) => setTheme(v as ThemeMode)}>
        <SelectTrigger size="sm" aria-label="Cambiar tema">
          <SelectValue>
            <span className="inline-flex items-center gap-2">
              {icon}
              <span className="capitalize">{theme}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <span className="inline-flex items-center gap-2">
              <SunIcon className="size-4" />
              <span>Claro</span>
            </span>
          </SelectItem>
          <SelectItem value="dark">
            <span className="inline-flex items-center gap-2">
              <MoonIcon className="size-4" />
              <span>Oscuro</span>
            </span>
          </SelectItem>
          <SelectItem value="system">
            <span className="inline-flex items-center gap-2">
              <LaptopIcon className="size-4" />
              <span>Sistema</span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}