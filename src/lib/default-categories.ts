export type DefaultCategory = {
  name: string;
  icon: string;
  color: string;
  type: "INCOME" | "EXPENSE";
};

// Auto-provisioned for every new user at registration (src/app/actions/auth.ts)
// and used by prisma/seed.ts for demo data. `icon` is a lucide-react icon
// name (see src/components/dashboard/category-icon.tsx for the lookup) and
// `color` is a Tailwind color token name (see src/lib/category-colors.ts).
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Income", icon: "TrendingUp", color: "emerald", type: "INCOME" },
  { name: "Groceries & Bills", icon: "ShoppingCart", color: "rose", type: "EXPENSE" },
  { name: "Campus / Education", icon: "GraduationCap", color: "indigo", type: "EXPENSE" },
  { name: "Discretionary", icon: "Sparkles", color: "amber", type: "EXPENSE" },
  { name: "Savings & Goals", icon: "PiggyBank", color: "emerald", type: "EXPENSE" },
  { name: "Debt Payment", icon: "CreditCard", color: "rose", type: "EXPENSE" },
  { name: "Other", icon: "CircleDollarSign", color: "slate", type: "EXPENSE" },
];
