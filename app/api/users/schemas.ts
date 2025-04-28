import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),
  role: z.enum(["admin", "manager", "developer", "team_lead"]),
  active: z.boolean().optional(),
});
