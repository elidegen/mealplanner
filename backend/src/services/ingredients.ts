export type IngredientLike = { name: string; amount: number; unit: string };

// Zwei Zutaten/Listeneintraege sind dieselbe Sache, wenn Name UND Einheit passen.
// Gross-/Kleinschreibung und Leerzeichen sollen dabei egal sein ("Mehl" == "mehl ").
// Unterschiedliche Einheiten bleiben getrennt: 1 kg und 500 g sind zwei Eintraege.
export function ingredientKey(name: string, unit: string) {
  return `${name.trim().toLowerCase()}|${unit.trim().toLowerCase()}`;
}

// Fasst gleiche Zutaten zu einer zusammen und addiert ihre Mengen.
// Die Schreibweise des ersten Vorkommens gewinnt, die Reihenfolge bleibt erhalten.
export function mergeIngredients(items: IngredientLike[]): IngredientLike[] {
  const merged = new Map<string, IngredientLike>();
  for (const item of items) {
    const key = ingredientKey(item.name, item.unit);
    const existing = merged.get(key);
    if (existing) {
      existing.amount += item.amount;
      continue;
    }
    // Kopie, damit die Addition oben nicht das uebergebene Objekt veraendert
    merged.set(key, {
      name: item.name.trim(),
      amount: item.amount,
      unit: item.unit.trim(),
    });
  }
  return [...merged.values()];
}
