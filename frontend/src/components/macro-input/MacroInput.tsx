import type { IMacros } from "../../types/MealTypes";
import IconCalc from "../../assets/img/icon_calculate.svg?react";
import "./MacroInput.css";

type Props = {
  addMacros: (macros: IMacros) => void;
  macros: IMacros | null;
};

function MacroInput({ macros, addMacros }: Props) {
  const { proteins, carbs, fat, calories } = macros ?? {
    proteins: null,
    carbs: null,
    fat: null,
    calories: null,
  };

  function update(next: Partial<IMacros>) {
    addMacros({ proteins, carbs, fat, calories, ...next });
  }

  // Ein leeres Zahlenfeld liefert NaN, was beim Speichern still zu null wird
  function toValue(input: number) {
    return Number.isNaN(input) ? null : input;
  }

  function calcCalories() {
    const calculated = (proteins ?? 0) * 4 + (carbs ?? 0) * 4 + (fat ?? 0) * 9;
    update({ calories: toValue(calculated) });
  }

  function updateCarbs(c: number) {
    update({ carbs: toValue(c) });
  }

  function updateProteins(p: number) {
    update({ proteins: toValue(p) });
  }

  function updateFat(f: number) {
    update({ fat: toValue(f) });
  }

  function updateCalories(c: number) {
    update({ calories: toValue(c) });
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
