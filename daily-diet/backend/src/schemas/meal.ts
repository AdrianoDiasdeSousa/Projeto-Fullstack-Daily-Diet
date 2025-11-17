import { z } from "zod";

export const mealCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  dateTime: z.string().datetime(), // ISO string
  inDiet: z.boolean(),
});

export const mealUpdateSchema = mealCreateSchema.partial();
