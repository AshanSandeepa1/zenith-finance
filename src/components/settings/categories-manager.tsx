"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/dashboard/category-icon";
import { categoryColorClasses } from "@/lib/category-colors";
import { CategoryDialog } from "@/components/settings/category-dialog";
import { deleteCategory } from "@/app/actions/categories";
import type { Category } from "@prisma/client";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteCategory(id);
        toast.success("Category deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Categories</p>
          <p className="text-xs text-muted-foreground">
            Customize how your income and expenses are grouped
          </p>
        </div>
        <CategoryDialog />
      </div>

      <div className="flex flex-col divide-y divide-border">
        {categories.map((category) => {
          const tone = categoryColorClasses(category.color);
          return (
            <div key={category.id} className="flex items-center gap-3 py-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${tone.bg} ${tone.text}`}>
                <CategoryIcon name={category.icon} className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {category.type === "INCOME" ? "Income" : "Expense"}
                  {category.budgetMonthly ? ` · Budget LKR ${category.budgetMonthly.toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <CategoryDialog category={category} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${category.name}`}
                  disabled={isPending}
                  onClick={() => handleDelete(category.id)}
                  className="text-muted-foreground hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
