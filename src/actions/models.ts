"use server";

import { db } from "@/lib/db";
import { modelSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createModel(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = modelSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.model.create({
    data: {
      name: parsed.data.name,
      agencyId: parsed.data.agencyId,
    },
  });

  revalidatePath("/dashboard/models");
  return { success: true };
}

export async function updateModel(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = modelSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.model.update({
    where: { id },
    data: {
      name: parsed.data.name,
      agencyId: parsed.data.agencyId,
    },
  });

  revalidatePath("/dashboard/models");
  return { success: true };
}

export async function deleteModel(id: string) {
  try {
    await db.model.update({
      where: { id },
      data: { isDeleted: true },
    });
    revalidatePath("/dashboard/models");
    revalidatePath("/dashboard/agencies");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete model:", error);
    return { error: "Не удалось удалить модель" };
  }
}
