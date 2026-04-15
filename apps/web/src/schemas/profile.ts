import { z } from "zod";

export const editProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-z0-9_.]+$/,
      "Username can only contain lowercase letters, numbers, underscores, and dots",
    ),
  bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
  country: z.string().nullable().optional(),
  profileColor: z.string().min(1, "Profile color is required"),
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;
