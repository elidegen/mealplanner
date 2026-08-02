import IconClose from "../../assets/img/icon_close.svg?react";
import type { IIngredient } from "../../pages/add-meal/MealTypes";
import "./IngredientList.css";

type Props = {
  ingredients: IIngredient[];
  removeIngredient?: (name: string) => void;
};

function IngredientList({ ingredients, removeIngredient }: Props) {
  return (
    <ul className="ingredient-wrapper">
      {ingredients.map((ingredient, index) => (
        <li className="ingredient" key={index}>
          <p>
            {ingredient.name} {ingredient.amount}
          </p>
          {removeIngredient && (
            <IconClose
              className="icon-close"
              onClick={() => removeIngredient(ingredient.name)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default IngredientList;
