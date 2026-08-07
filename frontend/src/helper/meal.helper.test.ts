import { describe, it, expect } from "vitest";
import {
  addOrMergeIngredient,
  extractAmountUnit,
  ingredientKey,
} from "./meal.helper";

describe("extractAmountUnit", () => {
  it("trennt Zahl und Einheit aus einer Eingabe", () => {
    expect(extractAmountUnit("200g")).toEqual({ value: 200, unit: "g" });
  });

  it("versteht Leerzeichen und deutsches Komma", () => {
    expect(extractAmountUnit("1,5 kg")).toEqual({ value: 1.5, unit: "kg" });
  });

  it("erlaubt Angaben ohne Einheit", () => {
    // "2 Eier" wird als Name "Eier" mit Menge 2 und leerer Einheit erfasst
    expect(extractAmountUnit("2")).toEqual({ value: 2, unit: "" });
  });

  it("lehnt Eingaben ohne fuehrende Zahl ab", () => {
    // null loest im Formular die Fehlermeldung aus, statt NaN zu speichern
    expect(extractAmountUnit("etwas Salz")).toBeNull();
    expect(extractAmountUnit("")).toBeNull();
  });
});

describe("addOrMergeIngredient", () => {
  it("haengt eine neue Zutat an", () => {
    const result = addOrMergeIngredient([], {
      name: " Mehl ",
      amount: 200,
      unit: " g ",
    });

    expect(result).toEqual([{ name: "Mehl", amount: 200, unit: "g" }]);
  });

  it("addiert zu einer vorhandenen Zutat und behaelt deren Position", () => {
    const list = [
      { name: "Mehl", amount: 200, unit: "g" },
      { name: "Zucker", amount: 50, unit: "g" },
    ];

    const result = addOrMergeIngredient(list, {
      name: "mehl",
      amount: 100,
      unit: "g",
    });

    expect(result).toEqual([
      { name: "Mehl", amount: 300, unit: "g" },
      { name: "Zucker", amount: 50, unit: "g" },
    ]);
  });

  it("trennt gleiche Namen mit anderer Einheit", () => {
    const list = [{ name: "Milch", amount: 1, unit: "l" }];

    const result = addOrMergeIngredient(list, {
      name: "Milch",
      amount: 200,
      unit: "ml",
    });

    expect(result).toHaveLength(2);
  });

  it("veraendert die uebergebene Liste nicht", () => {
    // React rendert nur neu, wenn ein neues Array zurueckkommt
    const list = [{ name: "Mehl", amount: 200, unit: "g" }];

    const result = addOrMergeIngredient(list, {
      name: "Mehl",
      amount: 100,
      unit: "g",
    });

    expect(list[0].amount).toBe(200);
    expect(result).not.toBe(list);
  });

  it("benutzt dieselbe Regel wie das Backend", () => {
    // ingredientKey existiert in Frontend und Backend doppelt, damit das
    // Formular sofort reagiert. Diese Erwartung haelt beide Seiten gleich.
    expect(ingredientKey(" Mehl ", "G")).toBe("mehl|g");
  });
});