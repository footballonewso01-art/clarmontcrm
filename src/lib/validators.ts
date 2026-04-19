import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  role: z.enum(["ADMIN", "WORKER", "AGENCY"]),
});

export const workerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  ratePerSubscriber: z.coerce.number().min(0, "Не может быть отрицательным").default(2),
});

export const modelSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  agencyId: z.string().min(1, "Выберите агентство"),
});

export const agencySchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  ratePerSubscriber: z.coerce.number().min(0, "Не может быть отрицательным").default(1.0),
});

export const trackingLinkSchema = z.object({
  workerId: z.string().min(1, "Выберите воркера"),
  modelId: z.string().min(1, "Выберите модель"),
  name: z.string().optional(),
  url: z.string().url("Некорректная ссылка"),
});

export const conversionSchema = z.object({
  workerId: z.string().min(1, "Выберите воркера"),
  modelId: z.string().min(1, "Выберите модель"),
  subscribersTotal: z.coerce.number().int().min(0),
});

export const payoutWorkerSchema = z.object({
  workerId: z.string().min(1, "Выберите воркера"),
});

export const payoutAgencySchema = z.object({
  agencyId: z.string().min(1, "Выберите агентство"),
  amount: z.coerce.number().positive("Сумма должна быть положительной"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type WorkerInput = z.infer<typeof workerSchema>;
export type ModelInput = z.infer<typeof modelSchema>;
export type AgencyInput = z.infer<typeof agencySchema>;
export type TrackingLinkInput = z.infer<typeof trackingLinkSchema>;
export type ConversionInput = z.infer<typeof conversionSchema>;
export type PayoutWorkerInput = z.infer<typeof payoutWorkerSchema>;
export type PayoutAgencyInput = z.infer<typeof payoutAgencySchema>;
