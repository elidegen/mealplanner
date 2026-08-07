import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JWT_SECRET } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  const { email, name, password } = req.body as {
    email?: string;
    name?: string;
    password?: string;
  };

  if (!email || !name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true },
  });

  res.status(201).json(user);
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  const user = await prisma.user.findUnique({ where: { email } });
  const valid =
    user && password && (await bcrypt.compare(password, user.passwordHash));

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Bewusst nur die userId im Token: Das aktive Home wechselt zur Laufzeit,
  // ein Token müsste sonst bei jedem Home-Wechsel neu ausgestellt werden.
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "24h",
  });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});
