"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { registerUser, type RegisterActionState } from "@/app/actions/auth";

const initialState: RegisterActionState = {};

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (!state.success) return;

    const formEl = document.getElementById("register-form") as HTMLFormElement | null;
    const email = (formEl?.elements.namedItem("email") as HTMLInputElement | null)?.value;
    const password = (formEl?.elements.namedItem("password") as HTMLInputElement | null)?.value;
    if (!email || !password) return;

    signIn("credentials", { email, password, redirect: false }).then(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }, [state.success, router]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start tracking your net worth with Zenith Finance</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="register-form" action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" type="text" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {state.error && <p className="text-sm text-rose-500">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
