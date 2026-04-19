"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createWorker(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const rate = parseFloat(formData.get("ratePerSubscriber") as string);
    const telegram = formData.get("telegram") as string;
    
    // Optional tracking link tracking
    const modelId = formData.get("modelId") as string;
    const url = formData.get("url") as string;
    const linkName = formData.get("linkName") as string;

    await db.worker.create({
      data: {
        name,
        telegram,
        ratePerSubscriber: rate || 0.60,
        trackingLinks: (modelId && url) ? {
          create: {
            modelId,
            name: linkName || null,
            url,
          }
        } : undefined
      },
    });

    revalidatePath("/dashboard/workers");
    return { success: true };
  } catch (error) {
    console.error("Failed to create worker:", error);
    return { error: "Не удалось создать воркера" };
  }
}

export async function updateWorker(id: string, data: {
  name?: string;
  telegram?: string;
  ratePerSubscriber?: number;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}) {
  try {
    await db.worker.update({
      where: { id },
      data: {
        name: data.name,
        telegram: data.telegram,
        ratePerSubscriber: data.ratePerSubscriber,
        status: data.status,
      },
    });

    revalidatePath("/dashboard/workers");
    revalidatePath(`/dashboard/workers/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update worker:", error);
    return { error: "Не удалось обновить данные воркера" };
  }
}

export async function deleteWorker(id: string) {
  try {
    await db.worker.update({
      where: { id },
      data: { isDeleted: true, status: "INACTIVE" },
    });
    
    revalidatePath("/dashboard/workers");
    revalidatePath("/dashboard/tracking");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete worker:", error);
    return { error: "Не удалось удалить воркера" };
  }
}
