"use server";

import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { registerSchema } from "@/lib/validators";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function register(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Пользователь с таким email уже существует" };
  }

  const hashedPassword = await bcryptjs.hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      hashedPassword,
      role: parsed.data.role,
    },
  });

  return { success: true };
}

export async function login(_prevState: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Неверный email или пароль" };
        default:
          return { error: "Ошибка авторизации" };
      }
    }
    throw error;
  }
}
