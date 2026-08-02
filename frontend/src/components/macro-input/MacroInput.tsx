import { useEffect, useState } from "react";
import type { IMacros } from "../../pages/add-meal/MealTypes";
import IconCalc from "../../assets/img/icon_calculate.svg?react";
import "./MacroInput.css";

type Props = {
  addMacros: (macros: IMacros) => void;
};

function MacroInput({ addMacros }: Props) {
  const [proteins, setProteins] = useState<number>();
  const [carbs, setCarbs] = useState<number>();
  const [fat, setFat] = useState<number>();
  const [calories, setCalories] = useState<number>();

  useEffect(() => {
    addMacros({ proteins, carbs, fat, calories });
  }, [fat, calories, carbs, proteins]);

  function calcCalories() {
    setCalories((proteins ?? 0) * 4 + (carbs ?? 0) * 4 + (fat ?? 0) * 9);
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
            value={carbs}
            onChange={(e) => setCarbs(e.target.valueAsNumber)}
          />
          <label htmlFor="fat">Fat</label>
          <input
            id="fat"
            type="number"
            placeholder="Enter fat"
            value={fat}
            onChange={(e) => setFat(e.target.valueAsNumber)}
          />
        </div>
        <div className="sec-wrapper">
          <label htmlFor="protein">Protein</label>
          <input
            id="protein"
            type="number"
            placeholder="Enter protein"
            value={proteins}
            onChange={(e) => setProteins(e.target.valueAsNumber)}
          />
          <label htmlFor="calories">Calories</label>
          <div className="calories-wrapper">
            <input
              id="calories"
              type="number"
              placeholder="Enter calories"
              value={calories}
              onChange={(e) => setCalories(e.target.valueAsNumber)}
            />
            <button className="calc-button icon-button" onClick={calcCalories}>
              <IconCalc />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MacroInput;
