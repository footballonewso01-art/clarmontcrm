"use server";

import { db } from "@/lib/db";
import { agencySchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createAgency(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = agencySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.agency.create({
    data: { 
      name: parsed.data.name,
      ratePerSubscriber: parsed.data.ratePerSubscriber
    },
  });

  revalidatePath("/dashboard/agencies");
  return { success: true };
}

export async function updateAgency(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = agencySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.agency.update({
    where: { id },
    data: { 
      name: parsed.data.name,
      ratePerSubscriber: parsed.data.ratePerSubscriber
    },
  });

  revalidatePath("/dashboard/agencies");
  revalidatePath(`/dashboard/agencies/${id}`);
  return { success: true };
}

export async function deleteAgency(id: string) {
  try {
    await db.$transaction(async (tx) => {
      await tx.agency.update({
        where: { id },
        data: { isDeleted: true },
      });
      await tx.model.updateMany({
        where: { agencyId: id },
        data: { isDeleted: true },
      });
    });

    revalidatePath("/dashboard/agencies");
    revalidatePath("/dashboard/models");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete agency:", error);
    return { error: "Не удалось удалить агентство" };
  }
}
