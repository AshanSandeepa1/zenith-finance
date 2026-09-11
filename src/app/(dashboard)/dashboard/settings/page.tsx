import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/settings/profile-form";
import { CategoriesManager } from "@/components/settings/categories-manager";
import { AccountsManager } from "@/components/settings/accounts-manager";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, categories, accounts] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.category.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.financialAccount.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, categories, and financial accounts
        </p>
      </div>

      <ProfileForm user={user} />
      <AccountsManager accounts={accounts} />
      <CategoriesManager categories={categories} />
    </div>
  );
}
