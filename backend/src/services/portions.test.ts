import { describe, it, expect } from "vitest";
import { availablePortions, planConsumption } from "./portions";

// Pfannkuchen fuer 2 Portionen
const PANCAKES = [
  { name: "Mehl", amount: 200, unit: "g" },
  { name: "Milch", amount: 300, unit: "ml" },
  { name: "Salz", amount: 0, unit: "" },
];

describe("availablePortions", () => {
  it("wird von der knappsten Zutat begrenzt", () => {
    // Mehl reicht fuer 5 Durchgaenge, Milch nur fuer 1 -> 1 x 2 Portionen
    const pantry = [
      { id: 1, name: "Mehl", amount: 1000, unit: "g" },
      { id: 2, name: "Milch", amount: 300, unit: "ml" },
    ];

    expect(availablePortions(PANCAKES, pantry, 2)).toBe(2);
  });

  it("rundet angefangene Portionen ab", () => {
    // Reicht fuer 1,5 Durchgaenge, also fuer 3 statt 3,5 Portionen
    const pantry = [
      { id: 1, name: "Mehl", amount: 350, unit: "g" },
      { id: 2, name: "Milch", amount: 450, unit: "ml" },
    ];

    expect(availablePortions(PANCAKES, pantry, 2)).toBe(3);
  });

  it("summiert mehrere Eintraege derselben Zutat", () => {
    // 2 x 150 ml Milch muessen zusammen einen Bedarf von 300 ml decken
    const pantry = [
      { id: 1, name: "Mehl", amount: 200, unit: "g" },
      { id: 2, name: "Milch", amount: 150, unit: "ml" },
      { id: 3, name: "milch", amount: 150, unit: "ml" },
    ];

    expect(availablePortions(PANCAKES, pantry, 2)).toBe(2);
  });

  it("verschluckt wegen Float-Ungenauigkeit keine Portion", () => {
    // 0.3 / 0.1 ergibt in JavaScript 2.9999... - ohne Toleranz waere
    // das Ergebnis 2 statt 3
    const meal = [{ name: "Oel", amount: 0.1, unit: "l" }];
    const pantry = [{ id: 1, name: "Oel", amount: 0.3, unit: "l" }];

    expect(availablePortions(meal, pantry, 1)).toBe(3);
  });

  it("ignoriert Zutaten ohne Menge", () => {
    // Ein leerer Vorrat wuerde ueber "Salz" sonst 0 Portionen erzwingen,
    // obwohl Mehl und Milch reichen
    const pantry = [
      { id: 1, name: "Mehl", amount: 200, unit: "g" },
      { id: 2, name: "Milch", amount: 300, unit: "ml" },
    ];

    expect(availablePortions(PANCAKES, pantry, 2)).toBe(2);
  });

  it("liefert 0, wenn eine Zutat fehlt", () => {
    const pantry = [{ id: 1, name: "Mehl", amount: 1000, unit: "g" }];

    expect(availablePortions(PANCAKES, pantry, 2)).toBe(0);
  });
});

describe("planConsumption", () => {
  it("reduziert den Vorrat um die skalierte Menge", () => {
    // 4 von 2 Portionen kochen -> Faktor 2
    const pantry = [
      { id: 1, name: "Mehl", amount: 1000, unit: "g" },
      { id: 2, name: "Milch", amount: 1000, unit: "ml" },
    ];

    const plan = planConsumption(PANCAKES, pantry, 2);

    expect(plan.updates).toEqual([
      { id: 1, amount: 600 },
      { id: 2, amount: 400 },
    ]);
    expect(plan.deletes).toEqual([]);
  });

  it("loescht Eintraege, die komplett aufgebraucht sind", () => {
    const pantry = [
      { id: 1, name: "Mehl", amount: 200, unit: "g" },
      { id: 2, name: "Milch", amount: 300, unit: "ml" },
    ];

    const plan = planConsumption(PANCAKES, pantry, 1);

    expect(plan.deletes).toEqual([1, 2]);
    expect(plan.updates).toEqual([]);
  });

  it("deckt eine Zutat aus mehreren Eintraegen", () => {
    // Bedarf 300 ml, im Vorrat 2 x 200 ml: der erste Eintrag geht drauf,
    // vom zweiten bleiben 100 ml uebrig
    const meal = [{ name: "Milch", amount: 300, unit: "ml" }];
    const pantry = [
      { id: 1, name: "Milch", amount: 200, unit: "ml" },
      { id: 2, name: "Milch", amount: 200, unit: "ml" },
    ];

    const plan = planConsumption(meal, pantry, 1);

    expect(plan.deletes).toEqual([1]);
    expect(plan.updates).toEqual([{ id: 2, amount: 100 }]);
    expect(plan.consumed).toEqual([{ name: "Milch", amount: 300, unit: "ml" }]);
  });

  it("verbraucht bei zu wenig Vorrat nur, was da ist", () => {
    const meal = [{ name: "Milch", amount: 300, unit: "ml" }];
    const pantry = [{ id: 1, name: "Milch", amount: 100, unit: "ml" }];

    const plan = planConsumption(meal, pantry, 1);

    expect(plan.deletes).toEqual([1]);
    // Gemeldet wird der tatsaechliche Verbrauch, nicht der Bedarf
    expect(plan.consumed).toEqual([{ name: "Milch", amount: 100, unit: "ml" }]);
  });

  it("fasst Zutaten ohne Menge nicht an", () => {
    const pantry = [{ id: 1, name: "Salz", amount: 500, unit: "g" }];

    const plan = planConsumption(PANCAKES, pantry, 1);

    expect(plan.updates).toEqual([]);
    expect(plan.deletes).toEqual([]);
    expect(plan.consumed.map((i) => i.name)).not.toContain("Salz");
  });
});