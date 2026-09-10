import type { LucideIcon } from "lucide-react";
import { Home, Receipt, Target, LineChart } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { label: "Sinking Funds", href: "/dashboard/sinking-funds", icon: Target },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart },
];
