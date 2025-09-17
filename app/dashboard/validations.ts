import { z } from "zod";

export const createCollectorSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().optional(),
});

export type CreateCollectorValues = z.infer<typeof createCollectorSchema>;
