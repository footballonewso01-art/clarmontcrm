"use server";

import { db } from "@/lib/db";
import { conversionSchema, trackingLinkSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createTrackingLink(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = trackingLinkSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db.trackingLink.findUnique({
    where: {
      workerId_modelId: {
        workerId: parsed.data.workerId,
        modelId: parsed.data.modelId,
      },
    },
  });
  if (existing) {
    return { error: "Tracking link для этой пары воркер-модель уже существует" };
  }

  await db.trackingLink.create({
    data: {
      workerId: parsed.data.workerId,
      modelId: parsed.data.modelId,
      name: parsed.data.name,
      url: parsed.data.url,
    },
  });

  revalidatePath("/dashboard/tracking");
  return { success: true };
}

export async function deleteTrackingLink(id: string) {
  await db.trackingLink.delete({ where: { id } });
  revalidatePath("/dashboard/tracking");
  return { success: true };
}

export async function recordConversion(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = conversionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.conversion.create({
    data: {
      workerId: parsed.data.workerId,
      modelId: parsed.data.modelId,
      subscribersTotal: parsed.data.subscribersTotal,
      revenueTotal: parsed.data.revenueTotal,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/workers");
  return { success: true };
}

export async function inlineRecordConversion(
  workerId: string,
  modelId: string,
  subscribersTotal: number
) {
  try {
    const model = await db.model.findUniqueOrThrow({
      where: { id: modelId },
      include: { agency: true }
    });
    
    // Revenue owed BY the agency is strictly based on their rate
    const rate = Number(model.agency.ratePerSubscriber);
    const revenueTotal = subscribersTotal * rate;

    await db.conversion.create({
      data: {
        workerId,
        modelId,
        subscribersTotal,
        revenueTotal,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/workers");
    revalidatePath(`/dashboard/workers/${workerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to inline record conversion:", error);
    return { error: "Не удалось записать конверсию." };
  }
}
