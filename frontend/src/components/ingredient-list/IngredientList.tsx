import IconClose from "../../assets/img/icon_close.svg?react";
import type { IIngredient } from "../../types/MealTypes";
import "./IngredientList.css";

type Props = {
  ingredients: IIngredient[];
  // Name allein identifiziert eine Zutat nicht — "Mehl 500 g" und "Mehl 1 kg"
  // stehen als zwei Einträge in der Liste
  removeIngredient?: (name: string, unit: string) => void;
};

function IngredientList({ ingredients, removeIngredient }: Props) {
  return (
    <ul className="ingredient-wrapper">
      {ingredients.map((ingredient, index) => (
        <li className="ingredient" key={index}>
          <p>
            {ingredient.name} {ingredient.amount}
            {ingredient.unit}
          </p>
          {removeIngredient && (
            <IconClose
              className="icon-close"
              onClick={() =>
                removeIngredient(ingredient.name, ingredient.unit)
              }
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default IngredientList;
