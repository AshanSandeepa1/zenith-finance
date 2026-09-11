"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { CURRENCIES } from "@/lib/currencies";
import { updateProfile } from "@/app/actions/settings";
import type { User } from "@prisma/client";

export function ProfileForm({ user }: { user: Pick<User, "name" | "baseCurrency"> }) {
  const [name, setName] = useState(user.name ?? "");
  const [baseCurrency, setBaseCurrency] = useState(user.baseCurrency);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfile({ name, baseCurrency });
        toast.success("Profile updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium">Profile</p>
        <p className="text-xs text-muted-foreground">Your name and preferred base currency</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-currency">Base currency</Label>
          <SelectNative
            id="profile-currency"
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </SelectNative>
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save profile
        </Button>
      </form>
    </div>
  );
}
