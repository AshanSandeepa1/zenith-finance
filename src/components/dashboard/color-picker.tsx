"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, categoryColorClasses } from "@/lib/category-colors";

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => {
        const tone = categoryColorClasses(color);
        return (
          <button
            key={color}
            type="button"
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              "h-7 w-7 rounded-full border-2 transition-transform",
              tone.bar,
              value === color ? "scale-110 border-foreground" : "border-transparent"
            )}
          />
        );
      })}
    </div>
  );
}
