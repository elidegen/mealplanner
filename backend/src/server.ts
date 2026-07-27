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
const currentHomeId: number = 0;

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

  const token = jwt.sign(
    { userId: user.id, homeId: currentHomeId },
    JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// Auth-Middleware
type JwtPayload = { userId: number; homeId: number };

interface AuthRequest extends Request {
  authData?: JwtPayload;
}

function requireAuth(req: AuthRequest, res: Response, next: Function) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }
  try {
    req.authData = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token ungültig oder abgelaufen" });
  }
}

// Meal-Routen
app.get("/api/meals", requireAuth, async (req: AuthRequest, res: Response) => {
  const homeId = Number(req.query.homeId);
  if (!homeId) return res.status(400).json({ error: "homeId ist Pflicht" });
  if (!(await isMember(req.user!.userId, homeId))) {
    return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
  }
  const meals = await prisma.meal.findMany({
    where: { homeId },
    include: { ingredients: true, macro: true, tags: true },
  });
  res.json(meals);
});

app.post("/api/meals", requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    name,
    portions,
    instructions,
    calories,
    homeId,
    ingredients = [],
  } = req.body as {
    name?: string;
    portions?: number;
    instructions?: string;
    calories?: number;
    homeId?: number;
    ingredients?: { name: string; amount: string }[];
  };

  if (!name || !homeId) {
    return res.status(400).json({ error: "name und homeId sind Pflicht" });
  }
  if (!(await isMember(req.user!.userId, homeId))) {
    return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
  }

  const meal = await prisma.meal.create({
    data: {
      name,
      portions: portions ?? 1,
      instructions,
      public: false,
      home: { connect: { id: homeId } },
      macro: { create: { calories } },
      ingredients: {
        create: ingredients.map((i) => ({
          name: i.name,
          amount: i.amount,
          homeId,
        })),
      },
    },
    include: { ingredients: true, macro: true },
  });
  res.status(201).json(meal);
});

app.delete(
  "/api/meals/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) return res.status(404).json({ error: "Meal nicht gefunden" });
    if (!meal.homeId || !(await isMember(req.user!.userId, meal.homeId))) {
      return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
    }
    await prisma.meal.delete({ where: { id } });
    res.status(204).send();
  },
);

// Home-Routen
// Der Einladungscode liegt im Feld `password` und wird nur an Admins ausgeliefert
app.get("/api/homes", requireAuth, async (req: AuthRequest, res: Response) => {
  const memberships = await prisma.homeMembership.findMany({
    where: { userId: req.user!.userId },
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
  if (!name) return res.status(400).json({ error: "Name ist Pflicht" });
  const home = await prisma.home.create({
    data: {
      name,
      password: generateJoinCode(),
      users: { create: { userId: req.user!.userId, role: "admin" } },
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
app.post(
  "/api/homes/join",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const code = (req.body as { code?: string }).code?.trim().toUpperCase();
    if (!code) return res.status(400).json({ error: "Code ist Pflicht" });

    const home = await prisma.home.findFirst({ where: { password: code } });
    if (!home)
      return res.status(404).json({ error: "Ungültiger Einladungscode" });

    if (await getRole(req.user!.userId, home.id)) {
      return res.status(409).json({ error: "Du bist bereits Mitglied" });
    }

    await prisma.homeMembership.create({
      data: { userId: req.user!.userId, homeId: home.id, role: "user" },
    });
    res.status(201).json({ id: home.id, name: home.name, role: "user" });
  },
);

// Mitglieder eines Homes — jedes Mitglied darf die Liste sehen
app.get(
  "/api/homes/:id/members",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const homeId = Number(req.params.id);
    if (!(await isMember(req.user!.userId, homeId))) {
      return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
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
      return res.status(400).json({ error: "Ungültige Rolle" });
    }
    if ((await getRole(req.user!.userId, homeId)) !== "admin") {
      return res.status(403).json({ error: "Nur Admins dürfen Rollen ändern" });
    }

    const target = await prisma.homeMembership.findFirst({
      where: { homeId, userId: targetId },
    });
    if (!target)
      return res.status(404).json({ error: "Mitglied nicht gefunden" });

    // Der letzte Admin darf sich nicht selbst degradieren
    if (
      target.role === "admin" &&
      role !== "admin" &&
      (await countAdmins(homeId)) === 1
    ) {
      return res.status(409).json({
        error: "Das Home braucht mindestens einen Admin",
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
    const isSelf = targetId === req.user!.userId;

    const myRole = await getRole(req.user!.userId, homeId);
    if (!myRole) {
      return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
    }
    // Andere entfernen darf nur ein Admin; austreten darf jeder selbst
    if (!isSelf && myRole !== "admin") {
      return res
        .status(403)
        .json({ error: "Nur Admins dürfen Mitglieder entfernen" });
    }

    const target = await prisma.homeMembership.findFirst({
      where: { homeId, userId: targetId },
    });
    if (!target)
      return res.status(404).json({ error: "Mitglied nicht gefunden" });

    if (target.role === "admin" && (await countAdmins(homeId)) === 1) {
      return res.status(409).json({
        error: isSelf
          ? "Befördere zuerst jemand anderen zum Admin"
          : "Das Home braucht mindestens einen Admin",
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
  if (!homeId) return res.status(400).json({ error: "homeId ist Pflicht" });
  if (!(await isMember(req.user!.userId, homeId))) {
    return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
  }
  const entries = await prisma.listEntry.findMany({ where: { homeId } });
  res.json(entries);
});

// Neuen Eintrag anlegen
app.post("/api/lists", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, amount, list, homeId } = req.body as {
    name?: string;
    amount?: string;
    list?: string;
    homeId?: number;
  };
  if (!name || !homeId || !list) {
    return res
      .status(400)
      .json({ error: "name, list und homeId sind Pflicht" });
  }
  if (!(await isMember(req.user!.userId, homeId))) {
    return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
  }
  const entry = await prisma.listEntry.create({
    data: { name, amount: amount ?? "", list, homeId },
  });
  res.status(201).json(entry);
});

// Eintrag verschieben (shopping -> pantry)
app.patch(
  "/api/lists/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { list } = req.body as { list?: string };
    const entry = await prisma.listEntry.findUnique({ where: { id } });
    if (!entry)
      return res.status(404).json({ error: "Eintrag nicht gefunden" });
    if (!(await isMember(req.user!.userId, entry.homeId))) {
      return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
    }
    const updated = await prisma.listEntry.update({
      where: { id },
      data: { list: list ?? entry.list },
    });
    res.json(updated);
  },
);

// Eintrag löschen
app.delete(
  "/api/lists/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const entry = await prisma.listEntry.findUnique({ where: { id } });
    if (!entry)
      return res.status(404).json({ error: "Eintrag nicht gefunden" });
    if (!(await isMember(req.user!.userId, entry.homeId))) {
      return res.status(403).json({ error: "Kein Zugriff auf dieses Home" });
    }
    await prisma.listEntry.delete({ where: { id } });
    res.status(204).send();
  },
);

app.listen(PORT, () => console.log(`API auf http://localhost:${PORT}`));
