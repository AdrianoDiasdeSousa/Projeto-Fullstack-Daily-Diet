import { Router } from "express";
import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../env";
import { requireAuth } from "../middlewares/auth";
import { registerSchema, loginSchema } from "../schemas/auth";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "email already used" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = jwt.sign({}, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  });

  return res
    .status(201)
    .json({ id: user.id, name: user.name, email: user.email });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "invalid credentials" });

  const token = jwt.sign({}, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  });

  return res.json({ id: user.id, name: user.name, email: user.email });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) return res.status(404).json({ message: "not found" });
  return res.json(user);
});

authRouter.post("/logout", async (_req, res) => {
  res.clearCookie("token");
  res.status(204).end();
});
