import { useState } from "react";
import type { IMacros } from "../../types/MealTypes";
import IconCalc from "../../assets/img/icon_calculate.svg?react";
import "./MacroInput.css";

type Props = {
  addMacros: (macros: IMacros) => void;
};

function MacroInput({ addMacros }: Props) {
  const [proteins, setProteins] = useState<number | null>(null);
  const [carbs, setCarbs] = useState<number | null>(null);
  const [fat, setFat] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);

  // Der frisch geaenderte Wert muss explizit uebergeben werden: die State-
  // Variablen hier stammen aus dem laufenden Render und kennen das gerade
  // geplante set...() noch nicht
  function updateMacros(next: Partial<IMacros>) {
    addMacros({ proteins, carbs, fat, calories, ...next });
  }

  // Ein leeres Zahlenfeld liefert NaN, was beim Speichern still zu null wird
  function toValue(input: number) {
    return Number.isNaN(input) ? null : input;
  }

  function calcCalories() {
    const calculated = (proteins ?? 0) * 4 + (carbs ?? 0) * 4 + (fat ?? 0) * 9;
    setCalories(calculated);
    updateMacros({ calories: calculated });
  }

  function updateCarbs(c: number) {
    const value = toValue(c);
    setCarbs(value);
    updateMacros({ carbs: value });
  }

  function updateProteins(p: number) {
    const value = toValue(p);
    setProteins(value);
    updateMacros({ proteins: value });
  }

  function updateFat(f: number) {
    const value = toValue(f);
    setFat(value);
    updateMacros({ fat: value });
  }

  function updateCalories(c: number) {
    const value = toValue(c);
    setCalories(value);
    updateMacros({ calories: value });
  }

  return (
    <>
      <div className="macro-wrapper">
        <div className="sec-wrapper">
          <label htmlFor="carbs">Carbs</label>
          <input
            id="carbs"
            type="number"
            placeholder="Enter carbs"
            value={carbs ?? ""}
            onChange={(e) => updateCarbs(e.target.valueAsNumber)}
          />
          <label htmlFor="fat">Fat</label>
          <input
            id="fat"
            type="number"
            placeholder="Enter fat"
            value={fat ?? ""}
            onChange={(e) => updateFat(e.target.valueAsNumber)}
          />
        </div>
        <div className="sec-wrapper">
          <label htmlFor="protein">Protein</label>
          <input
            id="protein"
            type="number"
            placeholder="Enter protein"
            value={proteins ?? ""}
            onChange={(e) => updateProteins(e.target.valueAsNumber)}
          />
          <label htmlFor="calories">Calories</label>
          <div className="calories-wrapper">
            <input
              id="calories"
              type="number"
              placeholder="Enter calories"
              value={calories ?? ""}
              onChange={(e) => updateCalories(e.target.valueAsNumber)}
            />
            <button
              className="calc-button icon-button"
              type="button"
              onClick={calcCalories}
            >
              <IconCalc />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MacroInput;
