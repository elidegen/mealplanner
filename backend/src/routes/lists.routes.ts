import { Router } from "express";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { isMember, canEdit } from "../services/permissions";
import { ingredientKey } from "../services/ingredients";
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
  const { name, amount, unit, list, homeId } = req.body as {
    name?: string;
    amount?: number;
    unit?: string;
    list?: string;
    homeId?: number;
  };
  // amount darf 0 sein und unit ein leerer String ("2 Eier"), deshalb kein truthy-Check
  if (!name || !homeId || !list || amount === undefined || unit === undefined) {
    return res
      .status(400)
      .json({ error: "name, list, amount, unit and homeId are required" });
  }
  if (!(await canEdit(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "No permission to edit" });
  }

  // Gibt es die Zutat in dieser Liste schon, wird nur die Menge erhoeht.
  // Lesen und Schreiben in einer Transaktion, damit zwei gleichzeitige
  // Anfragen nicht beide "nicht vorhanden" sehen und doppelt anlegen.
  const result = await prisma.$transaction(async (tx) => {
    // SQLite kann in der Query nicht case-insensitiv vergleichen, deshalb
    // wird die Liste geladen und der Vergleich in JS gemacht
    const entries = await tx.listEntry.findMany({ where: { homeId, list } });
    const key = ingredientKey(name, unit);
    const existing = entries.find(
      (entry) => ingredientKey(entry.name, entry.unit) === key,
    );

    if (!existing) {
      const created = await tx.listEntry.create({
        data: { name: name.trim(), amount, unit: unit.trim(), list, homeId },
      });
      return { entry: created, merged: false };
    }

    const updated = await tx.listEntry.update({
      where: { id: existing.id },
      data: { amount: existing.amount + amount },
    });
    return { entry: updated, merged: true };
  });

  res.status(result.merged ? 200 : 201).json(result.entry);
});

// Zutat abziehen (z.B. beim Kochen aus der Pantry).
// Muss VOR "/:id" stehen, sonst schluckt die :id-Route diesen Pfad.
listsRouter.patch(
  "/reduce-ingredient",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const { name, amount, unit, list, homeId } = req.body as {
      name?: string;
      amount?: number;
      unit?: string;
      list?: string;
      homeId?: number;
    };
    if (
      !name ||
      !homeId ||
      !list ||
      amount === undefined ||
      unit === undefined
    ) {
      return res
        .status(400)
        .json({ error: "name, list, amount, unit and homeId are required" });
    }
    if (!(await canEdit(req.authData!.userId, homeId))) {
      return res.status(403).json({ error: "No permission to edit" });
    }

    // Lesen und Schreiben in einer Transaktion, damit sich zwei gleichzeitige
    // Anfragen nicht gegenseitig den Bestand überschreiben
    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.listEntry.findFirst({
        where: { name, unit, list, homeId },
      });
      // Nicht vorhanden ist kein Fehler - dann gibt es einfach nichts abzuziehen
      if (!entry) return { status: "not-found" as const, entry: null };

      const remaining = entry.amount - amount;
      if (remaining <= 0) {
        await tx.listEntry.delete({ where: { id: entry.id } });
        return { status: "removed" as const, entry };
      }
      const updated = await tx.listEntry.update({
        where: { id: entry.id },
        data: { amount: remaining },
      });
      return { status: "reduced" as const, entry: updated };
    });

    res.json(result);
  },
);

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

    const targetList = list ?? entry.list;

    // Gibt es die Zutat in der Ziel-Liste schon, wandert nur die Menge dorthin
    // und der verschobene Eintrag verschwindet - deshalb "removedId" in der
    // Antwort, damit das Frontend weiss, welche Zeile es entfernen muss.
    const result = await prisma.$transaction(async (tx) => {
      const entries = await tx.listEntry.findMany({
        where: { homeId: entry.homeId, list: targetList },
      });
      const key = ingredientKey(entry.name, entry.unit);
      const twin = entries.find(
        (e) => e.id !== entry.id && ingredientKey(e.name, e.unit) === key,
      );

      if (!twin) {
        const updated = await tx.listEntry.update({
          where: { id },
          data: { list: targetList },
        });
        return { entry: updated, removedId: null as number | null };
      }

      const merged = await tx.listEntry.update({
        where: { id: twin.id },
        data: { amount: twin.amount + entry.amount },
      });
      await tx.listEntry.delete({ where: { id } });
      return { entry: merged, removedId: id as number | null };
    });

    res.json(result);
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
