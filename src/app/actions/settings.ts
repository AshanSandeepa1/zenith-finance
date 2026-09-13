"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { currencyCodeSchema } from "@/lib/currencies";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  baseCurrency: currencyCodeSchema,
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = profileSchema.parse(input);

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed,
  });

  // baseCurrency drives the rate/currency the (dashboard) layout resolves
  // for every page under it, not just Settings — revalidate that whole
  // shared layout, not just this one route.
  revalidatePath("/dashboard", "layout");
}

export async function updateBaseCurrency(baseCurrency: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = currencyCodeSchema.parse(baseCurrency);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { baseCurrency: parsed },
  });

  revalidatePath("/dashboard", "layout");
}
