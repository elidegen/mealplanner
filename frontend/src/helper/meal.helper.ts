import type { IIngredient } from "../types/MealTypes";

// Zwei Zutaten sind dieselbe Sache, wenn Name UND Einheit passen — Groß-/
// Kleinschreibung und Leerzeichen egal ("Mehl" == "mehl "). Unterschiedliche
// Einheiten bleiben getrennt: 1 kg und 500 g sind zwei Einträge.
// Gleiche Regel wie im Backend (services/ingredients.ts).
export function ingredientKey(name: string, unit: string) {
  return `${name.trim().toLowerCase()}|${unit.trim().toLowerCase()}`;
}

// Hängt die Zutat an die Liste an — oder addiert nur die Menge, wenn es sie
// schon gibt. Gibt immer ein neues Array zurück, damit React neu rendert.
export function addOrMergeIngredient(
  ingredients: IIngredient[],
  ingredient: IIngredient,
): IIngredient[] {
  const key = ingredientKey(ingredient.name, ingredient.unit);
  const existing = ingredients.find(
    (item) => ingredientKey(item.name, item.unit) === key,
  );

  if (!existing) {
    return [
      ...ingredients,
      {
        ...ingredient,
        name: ingredient.name.trim(),
        unit: ingredient.unit.trim(),
      },
    ];
  }

  // Position bleibt erhalten, nur das getroffene Objekt wird ersetzt
  return ingredients.map((item) =>
    item === existing
      ? { ...item, amount: item.amount + ingredient.amount }
      : item,
  );
}

export function extractAmountUnit(
  amount: string,
): { value: number; unit: string } | null {
  const match = amount.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;

  const [, numberPart, unitPart] = match;
  return {
    value: Number(numberPart.replace(",", ".")),
    unit: unitPart.trim(),
  };
}
