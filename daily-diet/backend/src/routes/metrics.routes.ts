import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middlewares/auth";

export const metricsRouter = Router();
metricsRouter.use(requireAuth);

// GET /metrics
metricsRouter.get("/", async (req, res) => {
  const userId = (req as any).userId as string;

  const [total, inside, outside, streak] = await Promise.all([
    prisma.meal.count({ where: { userId } }),
    prisma.meal.count({ where: { userId, inDiet: true } }),
    prisma.meal.count({ where: { userId, inDiet: false } }),
    bestStreak(userId),
  ]);

  res.json({ total, inside, outside, bestStreak: streak });
});

async function bestStreak(userId: string): Promise<number> {
  const meals = await prisma.meal.findMany({
    where: { userId },
    orderBy: { dateTime: "asc" },
    select: { inDiet: true },
  });
  let best = 0,
    cur = 0;
  for (const m of meals) {
    cur = m.inDiet ? cur + 1 : 0;
    if (cur > best) best = cur;
  }
  return best;
}
