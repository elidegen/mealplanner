import { Router } from "express";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import {
  Role,
  ROLES,
  getRole,
  isMember,
  countAdmins,
} from "../services/permissions";
import { generateJoinCode } from "../services/joinCode";

export const homesRouter = Router();

// Der Einladungscode liegt im Feld `password` und wird nur an Admins ausgeliefert
homesRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
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

homesRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
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
homesRouter.post(
  "/join",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const code = (req.body as { code?: string }).code?.trim().toUpperCase();
    if (!code) return res.status(400).json({ error: "Code is required" });

    const home = await prisma.home.findFirst({ where: { password: code } });
    if (!home)
      return res.status(404).json({ error: "Invalid invite code" });

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
  },
);

// Mitglieder eines Homes — jedes Mitglied darf die Liste sehen
homesRouter.get(
  "/:id/members",
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
homesRouter.patch(
  "/:id/members/:userId",
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
    if (!target)
      return res.status(404).json({ error: "Member not found" });

    // Der letzte Admin darf sich nicht selbst degradieren
    if (
      target.role === "admin" &&
      role !== "admin" &&
      (await countAdmins(homeId)) === 1
    ) {
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
homesRouter.delete(
  "/:id/members/:userId",
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
    if (!target)
      return res.status(404).json({ error: "Member not found" });

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
