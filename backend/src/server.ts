import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { IMacros } from "./types";

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

app.post("/api/auth/login", async (req: Request, res: Response) => {
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
    expiresIn: "1h",
  });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// Auth-Middleware
type JwtPayload = { userId: number };

interface AuthRequest extends Request {
  authData?: JwtPayload;
}

function requireAuth(req: AuthRequest, res: Response, next: Function) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    req.authData = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token invalid or expired" });
  }
}

// Meal-Routen
app.get("/api/meals", requireAuth, async (req: AuthRequest, res: Response) => {
  const homeId = Number(req.query.homeId);
  if (!homeId) return res.status(400).json({ error: "homeId is required" });
  if (!(await isMember(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "No access to this home" });
  }
  const meals = await prisma.meal.findMany({
    where: { homeId },
    include: { ingredients: true, macros: true, tags: true },
  });
  res.json(meals);
});

app.post("/api/meals", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, macros, ingredients, tags, instructions, portions, homeId } =
    req.body as {
      name?: string;
      ingredients?: { name: string; amount: string }[];
      tags?: { name: string }[];
      macros?: IMacros;
      instructions?: string;
      portions?: number;
      homeId?: number;
    };

  if (!name || !ingredients || !homeId) {
    return res
      .status(400)
      .json({ error: "name, ingredients and homeId are required" });
  }
  if (!(await canEdit(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "You do not have permission to edit" });
  }

  try {
    const meal = await prisma.meal.create({
      data: {
        name,
        macros: { create: macros },
        ingredients: {
          create: ingredients.map((ingredient) => ({
            ...ingredient,
            homeId,
          })),
        },
        tags: {
          connectOrCreate: tags?.map((tag) => ({
            where: { name_homeId: { name: tag.name, homeId } },
            create: { name: tag.name, homeId },
          })),
        },
        instructions,
        portions: portions ?? 1,
        home: { connect: { id: homeId } },
        public: false,
      },
      include: { ingredients: true, macros: true, tags: true },
    });
    res.status(201).json(meal);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});

app.delete(
  "/api/meals/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    if (!meal.homeId || !(await canEdit(req.authData!.userId, meal.homeId))) {
      return res.status(403).json({ error: "You do not have permission to edit" });
    }
    await prisma.meal.delete({ where: { id } });
    res.status(204).send();
  },
);

// Home-Routen
// Der Einladungscode liegt im Feld `password` und wird nur an Admins ausgeliefert
app.get("/api/homes", requireAuth, async (req: AuthRequest, res: Response) => {
  const memberships = await prisma.homeMembership.findMany({
    where: { userId: req.authData!.userId },
    include: { home: true },
  });
  res.json(
    memberships.map((m) => ({
      id: m.home.id,
      name: m.home.name,
      role: m.role,
      joinCode: m.role === "admin" ? m.home.password : undefined,
    })),
  );
});

app.post("/api/homes", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name) return res.status(400).json({ error: "Name is required" });
  const home = await prisma.home.create({
    data: {
      name,
      password: generateJoinCode(),
      users: {
        create: {
          userId: req.authData!.userId,
          role: "admin",
          lastLogin: new Date(),
        },
      },
    },
  });
  res.status(201).json({
    id: home.id,
    name: home.name,
    role: "admin",
    joinCode: home.password,
  });
});

// Home per Einladungscode beitreten
app.post("/api/homes/join", requireAuth, async (req: AuthRequest, res: Response) => {
  const code = (req.body as { code?: string }).code?.trim().toUpperCase();
  if (!code) return res.status(400).json({ error: "Code is required" });

  const home = await prisma.home.findFirst({ where: { password: code } });
  if (!home) return res.status(404).json({ error: "Invalid invite code" });

  if (await getRole(req.authData!.userId, home.id)) {
    return res.status(409).json({ error: "You are already a member" });
  }

  await prisma.homeMembership.create({
    data: {
      userId: req.authData!.userId,
      homeId: home.id,
      role: "user",
      lastLogin: new Date(),
    },
  });
  res.status(201).json({ id: home.id, name: home.name, role: "user" });
});

// Mitglieder eines Homes — jedes Mitglied darf die Liste sehen
app.get(
  "/api/homes/:id/members",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const homeId = Number(req.params.id);
    if (!(await isMember(req.authData!.userId, homeId))) {
      return res.status(403).json({ error: "No access to this home" });
    }
    const members = await prisma.homeMembership.findMany({
      where: { homeId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(
      members.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      })),
    );
  },
);

// Rolle ändern (befördern / degradieren) — nur Admins
app.patch(
  "/api/homes/:id/members/:userId",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const homeId = Number(req.params.id);
    const targetId = Number(req.params.userId);
    const { role } = req.body as { role?: Role };

    if (!role || !ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if ((await getRole(req.authData!.userId, homeId)) !== "admin") {
      return res.status(403).json({ error: "Only admins can change roles" });
    }

    const target = await prisma.homeMembership.findFirst({
      where: { homeId, userId: targetId },
    });
    if (!target) return res.status(404).json({ error: "Member not found" });

    // Der letzte Admin darf sich nicht selbst degradieren
    if (target.role === "admin" && role !== "admin" && (await countAdmins(homeId)) === 1) {
      return res.status(409).json({
        error: "The home needs at least one admin",
      });
    }

    const updated = await prisma.homeMembership.update({
      where: { id: target.id },
      data: { role },
    });
    res.json({ userId: targetId, role: updated.role });
  },
);

// Mitglied entfernen oder selbst austreten
app.delete(
  "/api/homes/:id/members/:userId",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const homeId = Number(req.params.id);
    const targetId = Number(req.params.userId);
    const isSelf = targetId === req.authData!.userId;

    const myRole = await getRole(req.authData!.userId, homeId);
    if (!myRole) {
      return res.status(403).json({ error: "No access to this home" });
    }
    // Andere entfernen darf nur ein Admin; austreten darf jeder selbst
    if (!isSelf && myRole !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can remove members" });
    }

    const target = await prisma.homeMembership.findFirst({
      where: { homeId, userId: targetId },
    });
    if (!target) return res.status(404).json({ error: "Member not found" });

    if (target.role === "admin" && (await countAdmins(homeId)) === 1) {
      return res.status(409).json({
        error: isSelf
          ? "Promote someone else to admin first"
          : "The home needs at least one admin",
      });
    }

    await prisma.homeMembership.delete({ where: { id: target.id } });
    res.status(204).send();
  },
);

// --- Rollen & Berechtigungen -------------------------------------------------
// Drei Stufen: admin (verwaltet Mitglieder), user (bearbeitet Inhalte), gast (liest nur)
type Role = "admin" | "user" | "gast";
const ROLES: Role[] = ["admin", "user", "gast"];

// Rolle des Users in einem Home; null = kein Mitglied
async function getRole(userId: number, homeId: number): Promise<Role | null> {
  const membership = await prisma.homeMembership.findFirst({
    where: { userId, homeId },
  });
  return membership ? (membership.role as Role) : null;
}

// Lesen darf jedes Mitglied
async function isMember(userId: number, homeId: number) {
  return (await getRole(userId, homeId)) !== null;
}

// Schreiben dürfen admin und user, aber nicht gast
async function canEdit(userId: number, homeId: number) {
  const role = await getRole(userId, homeId);
  return role === "admin" || role === "user";
}

// Wie viele Admins hat das Home? Verhindert, dass der letzte Admin verschwindet
async function countAdmins(homeId: number) {
  return prisma.homeMembership.count({ where: { homeId, role: "admin" } });
}

// Einladungscode: ohne I, O, 0 und 1, damit nichts verwechselt wird
function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

// Alle Einträge eines Homes
app.get("/api/lists", requireAuth, async (req: AuthRequest, res: Response) => {
  const homeId = Number(req.query.homeId);
  if (!homeId) return res.status(400).json({ error: "homeId is required" });
  if (!(await isMember(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "No access to this home" });
  }
  const entries = await prisma.listEntry.findMany({ where: { homeId } });
  res.json(entries);
});

// Neuen Eintrag anlegen
app.post("/api/lists", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, amount, list, homeId } = req.body as {
    name?: string; amount?: string; list?: string; homeId?: number;
  };
  if (!name || !homeId || !list) {
    return res.status(400).json({ error: "name, list and homeId are required" });
  }
  if (!(await canEdit(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "You do not have permission to edit" });
  }
  const entry = await prisma.listEntry.create({
    data: { name, amount: amount ?? "", list, homeId },
  });
  res.status(201).json(entry);
});

// Eintrag verschieben (shopping -> pantry)
app.patch("/api/lists/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { list } = req.body as { list?: string };
  const entry = await prisma.listEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ error: "Item not found" });
  if (!(await canEdit(req.authData!.userId, entry.homeId))) {
    return res.status(403).json({ error: "You do not have permission to edit" });
  }
  const updated = await prisma.listEntry.update({
    where: { id },
    data: { list: list ?? entry.list },
  });
  res.json(updated);
});

// Eintrag löschen
app.delete("/api/lists/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const entry = await prisma.listEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ error: "Item not found" });
  if (!(await canEdit(req.authData!.userId, entry.homeId))) {
    return res.status(403).json({ error: "You do not have permission to edit" });
  }
  await prisma.listEntry.delete({ where: { id } });
  res.status(204).send();
});

// Homes aus der Zeit vor den Einladungscodes nachträglich mit einem Code versehen
async function backfillJoinCodes() {
  const ohneCode = await prisma.home.findMany({ where: { password: "" } });
  for (const home of ohneCode) {
    await prisma.home.update({
      where: { id: home.id },
      data: { password: generateJoinCode() },
    });
  }
  if (ohneCode.length > 0) {
    console.log(`${ohneCode.length} Home(s) haben einen Einladungscode erhalten`);
  }
}

app.listen(PORT, async () => {
  await backfillJoinCodes();
  console.log(`API auf http://localhost:${PORT}`);
});
