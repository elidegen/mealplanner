import { Router } from "express";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { isMember, canEdit } from "../services/permissions";
import { ingredientKey, mergeIngredients } from "../services/ingredients";
import { IMacros, ITag } from "../types";
import { Ingredient } from "@prisma/client";

export const mealsRouter = Router();

// ?tags=vegan&tags=schnell - Express liefert bei einem Wert einen String,
// bei mehreren ein Array, ohne Parameter undefined
function parseTagNames(rawTags: unknown) {
  return (
    rawTags === undefined ? [] : Array.isArray(rawTags) ? rawTags : [rawTags]
  )
    .map((tag) => String(tag).trim())
    .filter((tag) => tag !== "");
}

mealsRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const homeId = Number(req.query.homeId);
  if (!homeId) return res.status(400).json({ error: "homeId is required" });
  if (!(await isMember(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "No access to this home" });
  }

  const tagNames = parseTagNames(req.query.tags);

  const meals = await prisma.meal.findMany({
    where: {
      homeId,
      // Ein eigenes "some" pro Tag, damit das Meal alle mitbringen muss.
      // Ohne Tags bleibt das Array leer und schränkt nichts ein.
      AND: tagNames.map((name) => ({ tags: { some: { name, homeId } } })),
    },
    include: { ingredients: true, macros: true, tags: true },
  });
  res.json(meals);
});

// Freigegebene Meals aus allen Homes fuer den Meal Browser. Ohne Home-Bezug,
// deshalb muss die Route vor "/:id" stehen - sonst landet "public" dort als id.
mealsRouter.get(
  "/public",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const tagNames = parseTagNames(req.query.tags);

    const meals = await prisma.meal.findMany({
      where: {
        public: true,
        // Jedes Home hat eigene Tag-Zeilen, ueber Homes hinweg zaehlt
        // deshalb nur der Name
        AND: tagNames.map((name) => ({ tags: { some: { name } } })),
      },
      include: { ingredients: true, macros: true, tags: true },
    });
    res.json(meals);
  },
);

mealsRouter.get(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const homeId = Number(req.query.homeId);
    if (!id || !homeId)
      return res.status(400).json({ error: "Id and homeId are required" });
    if (!(await isMember(req.authData!.userId, homeId))) {
      return res.status(403).json({ error: "No access to this home" });
    }
    // Meal aus einem fremden Home wird wie "nicht vorhanden" behandelt,
    // sonst verraet die Antwort, welche IDs es gibt
    const meal = await prisma.meal.findUnique({
      where: { id, homeId },
      include: { ingredients: true, macros: true, tags: true },
    });
    if (!meal) return res.status(404).json({ error: "Meal not found!" });
    res.json(meal);
  },
);

mealsRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, macros, ingredients, tags, instructions, portions, homeId } =
    req.body as {
      name?: string;
      ingredients?: { name: string; amount: number; unit: string }[];
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
          // Zweimal "200 g Mehl" im Formular wird zu einmal "400 g Mehl"
          create: mergeIngredients(ingredients).map((ingredient) => ({
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
      return res.status(403).json({ error: "No permission to edit" });
    }
    await prisma.meal.delete({ where: { id } });
    res.status(204).send();
  },
);

const PANTRY_LIST = "pantry";

// Kochen und Portionen rechnen geht mit eigenen Meals und mit freigegebenen
// Meals aus dem Meal Browser. Nicht erlaubt bleibt genau ein Fall: ein privates
// Meal eines fremden Homes. Ohne die Pruefung liesse sich ueber eine geratene
// id die komplette Zutatenliste jedes fremden Rezepts auslesen.
function isCookable(
  meal: { homeId: number | null; public: boolean },
  homeId: number,
) {
  return meal.homeId === homeId || meal.public;
}

// Wie viele Portionen des Meals der Vorrat hergibt.
// Die Zutatenmengen gelten fuer meal.portions Portionen, deshalb wird erst
// ausgerechnet, wie oft das Rezept komplett reicht, und das dann hochskaliert.
mealsRouter.get(
  "/:id/portions-amount",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const homeId = Number(req.query.homeId);
    if (!id) return res.status(400).json({ error: "id is required" });
    if (!homeId) return res.status(400).json({ error: "homeId is required" });
    if (!(await isMember(req.authData!.userId, homeId))) {
      return res.status(403).json({ error: "No access to this home" });
    }

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: { ingredients: true },
    });
    // Ein nicht erreichbares Meal wird wie "nicht vorhanden" behandelt,
    // sonst verraet die Antwort, welche IDs es gibt
    if (!meal || !isCookable(meal, homeId)) {
      return res.status(404).json({ error: "Meal not found" });
    }

    const pantry = await prisma.listEntry.findMany({
      where: { homeId, list: PANTRY_LIST },
    });

    // Dieselbe Zutat kann mehrfach im Vorrat liegen (2x "Milch 500 ml"),
    // deshalb pro Name+Einheit aufsummieren
    const stock = new Map<string, number>();
    for (const entry of pantry) {
      const key = ingredientKey(entry.name, entry.unit);
      stock.set(key, (stock.get(key) ?? 0) + entry.amount);
    }

    // Kleinster Faktor gewinnt: die knappste Zutat begrenzt das ganze Rezept
    let batches = Infinity;
    for (const ingredient of meal.ingredients) {
      // Zutaten ohne Menge ("Salz", "etwas Pfeffer") begrenzen nichts
      if (ingredient.amount <= 0) continue;
      const available =
        stock.get(ingredientKey(ingredient.name, ingredient.unit)) ?? 0;
      batches = Math.min(batches, available / ingredient.amount);
      if (batches === 0) break;
    }

    const portionsPerBatch = meal.portions > 0 ? meal.portions : 1;
    // Float-Division trifft glatte Werte nicht immer exakt (0.3 / 0.1 = 2.9999...),
    // die Toleranz verhindert, dass floor() eine ganze Portion verschluckt
    const portions =
      batches === Infinity
        ? portionsPerBatch
        : Math.floor(batches * portionsPerBatch + 1e-9);

    res.json({ portions });
  },
);

// Meal kochen: zieht die Zutaten fuer die gewuenschte Portionszahl vom Vorrat ab.
// Reicht der Vorrat nicht, wird abgezogen was da ist - der Rest wird ignoriert.
mealsRouter.post(
  "/:id/cook",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { homeId, portions } = req.body as {
      homeId?: number;
      portions?: number;
    };
    if (!id) return res.status(400).json({ error: "id is required" });
    if (!homeId) return res.status(400).json({ error: "homeId is required" });
    if (!portions || portions <= 0) {
      return res.status(400).json({ error: "portions must be greater than 0" });
    }
    if (!(await canEdit(req.authData!.userId, homeId))) {
      return res.status(403).json({ error: "No permission to edit" });
    }

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: { ingredients: true },
    });
    if (!meal || !isCookable(meal, homeId)) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Die Rezeptmengen gelten fuer meal.portions, deshalb auf die
    // gewuenschte Portionszahl hochrechnen
    const factor = portions / (meal.portions > 0 ? meal.portions : 1);

    // Alles in einer Transaktion: entweder wird das komplette Meal verbucht
    // oder gar nichts. Sonst bliebe der Vorrat bei einem Fehler auf halbem Weg
    // stehen und liesse sich nicht zurueckdrehen
    const consumed = await prisma.$transaction(async (tx) => {
      const pantry = await tx.listEntry.findMany({
        where: { homeId, list: PANTRY_LIST },
      });

      // Dieselbe Zutat kann auf mehrere Eintraege verteilt sein (2x "Milch 500 ml"),
      // die muessen zusammen einen Bedarf von 700 ml decken koennen
      const byKey = new Map<string, typeof pantry>();
      for (const entry of pantry) {
        const key = ingredientKey(entry.name, entry.unit);
        const existing = byKey.get(key);
        if (existing) existing.push(entry);
        else byKey.set(key, [entry]);
      }

      const used: { name: string; amount: number; unit: string }[] = [];
      for (const ingredient of meal.ingredients) {
        // Zutaten ohne Menge ("Salz", "etwas Pfeffer") verbrauchen nichts
        if (ingredient.amount <= 0) continue;

        const required = ingredient.amount * factor;
        let missing = required;
        const entries =
          byKey.get(ingredientKey(ingredient.name, ingredient.unit)) ?? [];

        for (const entry of entries) {
          // Float-Reste wie 1e-15 gelten als gedeckt
          if (missing <= 1e-9) break;
          // Ein Eintrag kann nie mehr hergeben als er hat
          const take = Math.min(entry.amount, missing);
          missing -= take;

          const remaining = entry.amount - take;
          if (remaining <= 1e-9) {
            await tx.listEntry.delete({ where: { id: entry.id } });
          } else {
            await tx.listEntry.update({
              where: { id: entry.id },
              data: { amount: remaining },
            });
          }
        }

        used.push({
          name: ingredient.name,
          // Was der Vorrat nicht hergab, wurde auch nicht abgezogen
          amount: required - missing,
          unit: ingredient.unit,
        });
      }
      return used;
    });

    res.json({ portions, consumed });
  },
);

// Nur die Freigabe umschalten. Ueber PUT /:id ginge das auch, wuerde dort
// aber saemtliche Zutaten loeschen und neu anlegen, nur um ein Boolean zu kippen
mealsRouter.patch(
  "/:id/public",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Id is invalid" });

    const { public: isPublic } = req.body as { public?: boolean };
    if (typeof isPublic !== "boolean") {
      return res.status(400).json({ error: "public must be a boolean" });
    }

    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    if (!meal.homeId || !(await canEdit(req.authData!.userId, meal.homeId))) {
      return res.status(403).json({ error: "No permission to edit" });
    }

    const updatedMeal = await prisma.meal.update({
      where: { id },
      data: { public: isPublic },
      include: { ingredients: true, macros: true, tags: true },
    });
    res.json(updatedMeal);
  },
);

mealsRouter.put(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Id is invalid" });
    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    if (!meal.homeId || !(await canEdit(req.authData!.userId, meal.homeId))) {
      return res.status(403).json({ error: "No permission to edit" });
    }
    const homeId = meal.homeId;
    const {
      name,
      ingredients,
      tags,
      macros,
      public: isPublic,
      portions,
      instructions,
    } = req.body as {
      name?: string;
      ingredients?: { name: string; unit: string; amount: number }[];
      tags: { name: string }[];
      macros: {
        calories: number | null;
        proteins: number | null;
        carbs: number | null;
        fat: number | null;
      };
      public: boolean;
      portions: number;
      instructions: string;
    };
    if (!name || !ingredients || !portions) {
      return res.status(400).json({ error: "Cannot edit, invalid meal" });
    }

    try {
      const updatedMeal = await prisma.meal.update({
        where: { id },
        data: {
          name,
          macros: macros
            ? { upsert: { create: macros, update: macros } }
            : undefined,
          ingredients: {
            deleteMany: {},
            create: mergeIngredients(ingredients).map((ingredient) => ({
              ...ingredient,
              homeId,
            })),
          },
          tags: {
            set: [],
            connectOrCreate: tags?.map((tag) => ({
              where: { name_homeId: { name: tag.name, homeId } },
              create: { name: tag.name, homeId },
            })),
          },
          instructions,
          portions,
          public: isPublic,
        },
        include: { ingredients: true, macros: true, tags: true },
      });
      res.status(200).json(updatedMeal);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  },
);
