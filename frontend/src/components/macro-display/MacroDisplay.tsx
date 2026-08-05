import type { IMacros } from "../../types/MealTypes";

type Props = {
  macros: IMacros;
};

function MacroDisplay({ macros }: Props) {
  return (
    <>
      <div className="macro-wrapper">
        <div className="sec-wrapper">
          <p>Carbs: {macros.carbs}</p>
          <p>Fat: {macros.fat}</p>
        </div>
        <div className="sec-wrapper">
          <p>Proteins: {macros.proteins}</p>
          <p>Calories: {macros.calories}</p>
        </div>
      </div>
    </>
  );
}

export default MacroDisplay;
