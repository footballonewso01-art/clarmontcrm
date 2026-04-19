"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { executeWorkerPayout } from "@/lib/services/payout-service";
import { revalidatePath } from "next/cache";

export async function processWorkerPayout(workerId: string, modelId: string) {
  const result = await executeWorkerPayout(workerId, modelId);

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/workers");
  revalidatePath(`/dashboard/workers/${workerId}`);
  revalidatePath("/dashboard/payouts");
  return { success: true, payoutId: result.payoutId };
}

export async function processAgencyPayout(agencyId: string, amount: number) {
  if (amount <= 0) {
    return { error: "Сумма должна быть положительной" };
  }

  await db.payoutAgency.create({
    data: {
      agencyId,
      amount: new Prisma.Decimal(amount),
      date: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agencies");
  revalidatePath(`/dashboard/agencies/${agencyId}`);
  revalidatePath("/dashboard/payouts");
  return { success: true };
}
