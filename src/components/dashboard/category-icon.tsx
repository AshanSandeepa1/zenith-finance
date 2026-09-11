"use client";

import {
  TrendingUp,
  ShoppingCart,
  GraduationCap,
  Sparkles,
  PiggyBank,
  CreditCard,
  CircleDollarSign,
  Gamepad2,
  Plane,
  Home,
  Car,
  Heart,
  Gift,
  Utensils,
  Shirt,
  Smartphone,
  Dumbbell,
  Baby,
  PawPrint,
  Wrench,
  Wallet,
  Landmark,
  ShieldCheck,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  ShoppingCart,
  GraduationCap,
  Sparkles,
  PiggyBank,
  CreditCard,
  CircleDollarSign,
  Gamepad2,
  Plane,
  Home,
  Car,
  Heart,
  Gift,
  Utensils,
  Shirt,
  Smartphone,
  Dumbbell,
  Baby,
  PawPrint,
  Wrench,
  Wallet,
  Landmark,
  ShieldCheck,
  Briefcase,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? CircleDollarSign;
  return <Icon className={className ?? "h-4 w-4"} />;
}
