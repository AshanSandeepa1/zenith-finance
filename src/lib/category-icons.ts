// Plain data (no "use client") so it's safely importable from both server
// actions (zod validation) and client components (icon picker/renderer) —
// icon components themselves are resolved separately in
// src/components/dashboard/category-icon.tsx, which is client-only.
export const ICON_OPTIONS = [
  "TrendingUp",
  "ShoppingCart",
  "GraduationCap",
  "Sparkles",
  "PiggyBank",
  "CreditCard",
  "CircleDollarSign",
  "Gamepad2",
  "Plane",
  "Home",
  "Car",
  "Heart",
  "Gift",
  "Utensils",
  "Shirt",
  "Smartphone",
  "Dumbbell",
  "Baby",
  "PawPrint",
  "Wrench",
  "Wallet",
  "Landmark",
  "ShieldCheck",
  "Briefcase",
] as const;

export type IconName = (typeof ICON_OPTIONS)[number];
