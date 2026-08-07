import { describe, it, expect } from "vitest";
import { ingredientKey, mergeIngredients } from "./ingredients";

describe("ingredientKey", () => {
  it("ignoriert Gross-/Kleinschreibung und Leerzeichen", () => {
    expect(ingredientKey(" Mehl ", "G")).toBe(ingredientKey("mehl", "g"));
  });

  it("haelt unterschiedliche Einheiten auseinander", () => {
    // 1 kg und 500 g sind zwei Eintraege, weil ohne Einheitensystem
    // jede Umrechnung geraten waere
    expect(ingredientKey("Mehl", "kg")).not.toBe(ingredientKey("Mehl", "g"));
  });
});

describe("mergeIngredients", () => {
  it("fasst dieselbe Zutat zusammen und addiert die Mengen", () => {
    const merged = mergeIngredients([
      { name: "Mehl", amount: 200, unit: "g" },
      { name: "Zucker", amount: 50, unit: "g" },
      { name: "mehl", amount: 200, unit: "g" },
    ]);

    expect(merged).toEqual([
      // Die Schreibweise des ersten Vorkommens gewinnt, die Reihenfolge bleibt
      { name: "Mehl", amount: 400, unit: "g" },
      { name: "Zucker", amount: 50, unit: "g" },
    ]);
  });

  it("laesst gleiche Namen mit anderer Einheit getrennt", () => {
    const merged = mergeIngredients([
      { name: "Milch", amount: 1, unit: "l" },
      { name: "Milch", amount: 200, unit: "ml" },
    ]);

    expect(merged).toHaveLength(2);
  });

  it("veraendert die uebergebenen Objekte nicht", () => {
    const input = [
      { name: "Mehl", amount: 200, unit: "g" },
      { name: "Mehl", amount: 100, unit: "g" },
    ];
    mergeIngredients(input);

    expect(input[0].amount).toBe(200);
  });
});