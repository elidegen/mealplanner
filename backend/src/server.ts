import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET!;

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { email, name, password } = req.body as {
    email?: string;
    name?: string;
    password?: string;
  };

  if (!email || !name || !password) {
    return res.status(400).json({ error: "Alle Felder sind Pflicht" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "E-Mail bereits registriert" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true },
  });

  res.status(201).json(user);
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  const user = await prisma.user.findUnique({ where: { email } });
  const valid =
    user && password && (await bcrypt.compare(password, user.passwordHash));

  if (!valid) {
    return res.status(401).json({ error: "Ungültige Zugangsdaten" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// Auth-Middleware
type JwtPayload = { userId: number };

interface AuthRequest extends Request {
  user?: JwtPayload;
}

function requireAuth(req: AuthRequest, res: Response, next: Function) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token ungültig oder abgelaufen" });
  }
}

// Meal-Routen
app.get("/api/meals", requireAuth, async (req: AuthRequest, res: Response) => {
  const meals = await prisma.meal.findMany({
    where: { userId: req.user!.userId },
    include: { ingredients: true },
  });
  res.json(meals);
});

app.post("/api/meals", requireAuth, async (req: AuthRequest, res: Response) => {
  const { title, calories, ingredients } = req.body as {
    title?: string;
    calories?: number;
    ingredients?: { name: string; amount: string }[];
  };
  if (!title || !ingredients) {
    return res
      .status(400)
      .json({ error: "Title and ingredients are mandatory" });
  }
  const meal = await prisma.meal.create({
    data: {
      title,
      calories,
      user: { connect: { id: req.user!.userId } },
      ingredients: { create: ingredients },
    },
    include: { ingredients: true },
  });
  res.status(201).json(meal);
});

app.delete(
  "/api/meals/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    await prisma.meal.delete({ where: { id, userId: req.user!.userId } });
    res.status(204).send();
  },
);

app.listen(PORT, () => console.log(`API auf http://localhost:${PORT}`));
