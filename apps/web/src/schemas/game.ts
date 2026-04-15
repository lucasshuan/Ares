import { z } from "zod";

const urlSchema = z
  .string()
  .url("Must be a valid URL")
  .or(z.literal(""))
  .nullable()
  .optional();

export const editGameSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  backgroundImageUrl: urlSchema,
  thumbnailImageUrl: urlSchema,
  steamUrl: urlSchema,
});

export type EditGameValues = z.infer<typeof editGameSchema>;
