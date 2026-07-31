import { Router } from "express";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { isMember, canEdit } from "../services/permissions";
import { IMacros } from "../types";

export const mealsRouter = Router();

mealsRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
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

mealsRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
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
    return res.status(403).json({ error: "No permission to edit" });
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

mealsRouter.delete(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    if (!meal.homeId || !(await canEdit(req.authData!.userId, meal.homeId))) {
      return res
        .status(403)
        .json({ error: "No permission to edit" });
    }
    await prisma.meal.delete({ where: { id } });
    res.status(204).send();
  },
);
