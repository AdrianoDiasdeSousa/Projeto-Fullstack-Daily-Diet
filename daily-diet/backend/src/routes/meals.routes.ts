import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middlewares/auth";
import { mealCreateSchema, mealUpdateSchema } from "../schemas/meal";

export const mealsRouter = Router();
mealsRouter.use(requireAuth);

// Listar todas as refeições do usuário
mealsRouter.get("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const meals = await prisma.meal.findMany({
    where: { userId },
    orderBy: { dateTime: "desc" },
  });
  res.json(meals);
});

// Visualizar uma refeição
mealsRouter.get("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  const meal = await prisma.meal.findFirst({ where: { id, userId } });
  if (!meal) return res.status(404).json({ message: "not found" });
  res.json(meal);
});

// Criar
mealsRouter.post("/", async (req, res) => {
  const userId = (req as any).userId as string;
  const parsed = mealCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const meal = await prisma.meal.create({
    data: { ...parsed.data, dateTime: new Date(parsed.data.dateTime), userId },
  });
  res.status(201).json(meal);
});

// Editar
mealsRouter.put("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  const parsed = mealUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const exists = await prisma.meal.findFirst({ where: { id, userId } });
  if (!exists) return res.status(404).json({ message: "not found" });

  const data = { ...parsed.data } as any;
  if (data.dateTime) data.dateTime = new Date(data.dateTime);

  const meal = await prisma.meal.update({ where: { id }, data });
  res.json(meal);
});

// Apagar
mealsRouter.delete("/:id", async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  const exists = await prisma.meal.findFirst({ where: { id, userId } });
  if (!exists) return res.status(404).json({ message: "not found" });

  await prisma.meal.delete({ where: { id } });
  res.status(204).end();
});
