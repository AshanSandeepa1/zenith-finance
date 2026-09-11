// Curated color tokens a user can assign to a category. Maps to Tailwind
// utility classes so every category renders as a themed icon chip + accent
// bar consistently, in both light and dark mode.
export const CATEGORY_COLORS = [
  "emerald",
  "indigo",
  "rose",
  "amber",
  "sky",
  "violet",
  "cyan",
  "slate",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

const CLASS_MAP: Record<CategoryColor, { bg: string; text: string; bar: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", bar: "bg-emerald-500" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500", bar: "bg-indigo-500" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", bar: "bg-rose-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", bar: "bg-amber-500" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-500", bar: "bg-sky-500" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", bar: "bg-violet-500" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", bar: "bg-cyan-500" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-500", bar: "bg-slate-500" },
};

export function categoryColorClasses(color: string) {
  return CLASS_MAP[color as CategoryColor] ?? CLASS_MAP.slate;
}
