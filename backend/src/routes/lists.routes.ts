import { Router } from "express";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { isMember, canEdit } from "../services/permissions";
import { IListEntry } from "../types";

export const listsRouter = Router();

// Alle Einträge eines Homes
listsRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const homeId = Number(req.query.homeId);
  if (!homeId) return res.status(400).json({ error: "homeId is required" });
  if (!(await isMember(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "No access to this home" });
  }
  const entries = await prisma.listEntry.findMany({ where: { homeId } });
  res.json(entries);
});

// Neuen Eintrag anlegen
listsRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, amount, list, homeId } = req.body as {
    name?: string;
    amount?: string;
    list?: string;
    homeId?: number;
  };
  if (!name || !homeId || !list) {
    return res
      .status(400)
      .json({ error: "name, list and homeId are required" });
  }
  if (!(await canEdit(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "No permission to edit" });
  }
  const entry = await prisma.listEntry.create({
    data: { name, amount: amount ?? "", list, homeId },
  });
  res.status(201).json(entry);
});

// Mehrere Einträge gleichzeitig anlegen
// listsRouter.post("/shopping", requireAuth, async (req: AuthRequest, res: Response) => {
//   const payload = req.body as IListEntry[];
//   payload.forEach(async (el) => {
//     if (!el.name || !el.homeId || !el.list || !el.amount) {
//       return res.status(400).json({ error: "Incomplete objects!" });
//     }

//     if (!(await canEdit(req.authData!.userId, payload[0]!.homeId!))) {
//       return res.status(403).json({ error: "No permission to edit" });
//     }
//     await prisma.listEntry.create({
//       data: {
//         name: el.name,
//         amount: el.amount,
//         list: el.list,
//         homeId: el.homeId,
//       },
//     });
//   });

//   res.status(201).json("Listentry successfully created!");
// });

// Eintrag verschieben (shopping -> pantry)
listsRouter.patch(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { list } = req.body as { list?: string };
    const entry = await prisma.listEntry.findUnique({ where: { id } });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    if (!(await canEdit(req.authData!.userId, entry.homeId))) {
      return res.status(403).json({ error: "No permission to edit" });
    }
    const updated = await prisma.listEntry.update({
      where: { id },
      data: { list: list ?? entry.list },
    });
    res.json(updated);
  },
);

// Eintrag löschen
listsRouter.delete(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const entry = await prisma.listEntry.findUnique({ where: { id } });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    if (!(await canEdit(req.authData!.userId, entry.homeId))) {
      return res.status(403).json({ error: "No permission to edit" });
    }
    await prisma.listEntry.delete({ where: { id } });
    res.status(204).send();
  },
);
