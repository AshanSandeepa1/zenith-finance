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

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
