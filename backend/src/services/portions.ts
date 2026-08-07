import { ingredientKey, type IngredientLike } from "./ingredients";

// Ein Vorratseintrag, so wie er in der ListEntry-Tabelle liegt
export type PantryEntry = {
  id: number;
  name: string;
  amount: number;
  unit: string;
};

// Float-Division trifft glatte Werte nicht immer exakt (0.3 / 0.1 = 2.9999...).
// Alles unterhalb dieser Schwelle gilt als null bzw. als gedeckt.
const EPSILON = 1e-9;

// Dieselbe Zutat kann auf mehrere Eintraege verteilt sein (2x "Milch 500 ml"),
// deshalb pro Name+Einheit zusammenfassen.
export function stockByKey(entries: PantryEntry[]): Map<string, number> {
  const stock = new Map<string, number>();
  for (const entry of entries) {
    const key = ingredientKey(entry.name, entry.unit);
    stock.set(key, (stock.get(key) ?? 0) + entry.amount);
  }
  return stock;
}

// Wie viele Portionen des Meals der Vorrat hergibt.
// Die Zutatenmengen gelten fuer mealPortions Portionen, deshalb wird erst
// ausgerechnet, wie oft das Rezept komplett reicht, und das dann hochskaliert.
export function availablePortions(
  ingredients: IngredientLike[],
  pantry: PantryEntry[],
  mealPortions: number,
): number {
  const stock = stockByKey(pantry);

  // Kleinster Faktor gewinnt: die knappste Zutat begrenzt das ganze Rezept
  let batches = Infinity;
  for (const ingredient of ingredients) {
    // Zutaten ohne Menge ("Salz", "etwas Pfeffer") begrenzen nichts
    if (ingredient.amount <= 0) continue;
    const available =
      stock.get(ingredientKey(ingredient.name, ingredient.unit)) ?? 0;
    batches = Math.min(batches, available / ingredient.amount);
    if (batches === 0) break;
  }

  const portionsPerBatch = mealPortions > 0 ? mealPortions : 1;
  // Ein Rezept ganz ohne Mengenangaben ist nie durch den Vorrat begrenzt
  if (batches === Infinity) return portionsPerBatch;
  // Die Toleranz verhindert, dass floor() eine ganze Portion verschluckt
  return Math.floor(batches * portionsPerBatch + EPSILON);
}

// Welche Vorratseintraege das Kochen anfasst. Reine Rechnung ohne Datenbank:
// Der Aufrufer fuehrt updates und deletes in einer Transaktion aus.
export type ConsumptionPlan = {
  updates: { id: number; amount: number }[];
  deletes: number[];
  consumed: IngredientLike[];
};

// Deckt den Bedarf jeder Zutat aus dem Vorrat. Reicht der Vorrat nicht, wird
// verbraucht was da ist - der Rest wird ignoriert und in consumed nicht mitgezaehlt.
export function planConsumption(
  ingredients: IngredientLike[],
  pantry: PantryEntry[],
  factor: number,
): ConsumptionPlan {
  // Gruppierung statt Summe: hier muessen die einzelnen Eintraege erhalten
  // bleiben, weil sie einzeln reduziert oder geloescht werden
  const byKey = new Map<string, PantryEntry[]>();
  for (const entry of pantry) {
    const key = ingredientKey(entry.name, entry.unit);
    const existing = byKey.get(key);
    if (existing) existing.push(entry);
    else byKey.set(key, [entry]);
  }

  const plan: ConsumptionPlan = { updates: [], deletes: [], consumed: [] };

  for (const ingredient of ingredients) {
    // Zutaten ohne Menge ("Salz", "etwas Pfeffer") verbrauchen nichts
    if (ingredient.amount <= 0) continue;

    const required = ingredient.amount * factor;
    let missing = required;
    const entries =
      byKey.get(ingredientKey(ingredient.name, ingredient.unit)) ?? [];

    for (const entry of entries) {
      if (missing <= EPSILON) break;
      // Ein Eintrag kann nie mehr hergeben als er hat
      const take = Math.min(entry.amount, missing);
      missing -= take;

      const remaining = entry.amount - take;
      if (remaining <= EPSILON) plan.deletes.push(entry.id);
      else plan.updates.push({ id: entry.id, amount: remaining });
    }

    plan.consumed.push({
      name: ingredient.name,
      // Was der Vorrat nicht hergab, wurde auch nicht abgezogen
      amount: required - missing,
      unit: ingredient.unit,
    });
  }

  return plan;
}
