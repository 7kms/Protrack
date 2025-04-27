import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  logo: z.string().optional(),
  difficultyMultiplier: z.number().min(0.1).max(5),
});
