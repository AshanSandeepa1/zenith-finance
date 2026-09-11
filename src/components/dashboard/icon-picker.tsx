"use client";

import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/dashboard/category-icon";
import { ICON_OPTIONS } from "@/lib/category-icons";
import { categoryColorClasses } from "@/lib/category-colors";

export function IconPicker({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (icon: string) => void;
  color: string;
}) {
  const tone = categoryColorClasses(color);
  return (
    <div className="grid grid-cols-8 gap-2">
      {ICON_OPTIONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
            value === icon
              ? cn(tone.bg, tone.text, "border-current")
              : "border-border text-muted-foreground hover:bg-accent"
          )}
        >
          <CategoryIcon name={icon} className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
