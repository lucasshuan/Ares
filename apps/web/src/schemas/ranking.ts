import { z } from "zod";

export const addRankingSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  ratingSystem: z.enum(["elo", "points"]),
  initialElo: z.number().min(0).optional(),
  allowDraw: z.boolean(),
  kFactor: z.number().min(1).max(100).optional(),
  scoreRelevance: z.number().min(0).max(1).optional(),
  inactivityDecay: z.number().min(0).optional(),
  inactivityThresholdHours: z.number().min(1).optional(),
  inactivityDecayFloor: z.number().min(0).optional(),
  pointsPerWin: z.number().min(0).optional(),
  pointsPerDraw: z.number().min(0).optional(),
  pointsPerLoss: z.number().min(0).optional(),
  gameId: z.string().min(1, "Game is required"),
});

export const editRankingSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  ratingSystem: z.enum(["elo", "points"]),
  initialElo: z.number().min(0),
  allowDraw: z.boolean(),
  kFactor: z.number().min(1).max(100),
  scoreRelevance: z.number().min(0).max(1),
  inactivityDecay: z.number().min(0),
  inactivityThresholdHours: z.number().min(1),
  inactivityDecayFloor: z.number().min(0),
  pointsPerWin: z.number().min(0),
  pointsPerDraw: z.number().min(0),
  pointsPerLoss: z.number().min(0),
});

export type AddRankingValues = z.infer<typeof addRankingSchema>;
export type EditRankingValues = z.infer<typeof editRankingSchema>;

export const RANKING_DEFAULT_SETTINGS = {
  initialElo: 1200,
  kFactor: 32,
  scoreRelevance: 0.5,
  inactivityDecay: 0,
  inactivityThresholdHours: 24,
  inactivityDecayFloor: 0,
  pointsPerWin: 3,
  pointsPerDraw: 1,
  pointsPerLoss: 0,
} as const;
