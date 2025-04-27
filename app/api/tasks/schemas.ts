import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1),
  issueLink: z.string().optional(),
  projectId: z.number(),
  assignedToId: z.number().optional(),
  status: z.enum([
    "not_started",
    "developing",
    "testing",
    "online",
    "suspended",
    "canceled",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  category: z.enum(["op", "h5", "architecture"]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  contributionScore: z
    .number()
    .min(-10, "Contribution score must be at least -10")
    .max(10, "Contribution score must be at most 10")
    .optional(),
});
