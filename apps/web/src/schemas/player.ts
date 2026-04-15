import { z } from "zod";

export const addPlayerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters"),
  userId: z.string().nullable().optional(),
});

export const addPlayerToRankingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters"),
});

export type AddPlayerValues = z.infer<typeof addPlayerSchema>;
export type AddPlayerToRankingValues = z.infer<typeof addPlayerToRankingSchema>;
