import { useState } from "react";
import type { IIngredient } from "../../pages/add-meal/MealTypes";
import IngredientList from "../ingredient-list/IngredientList";
import IconAdd from "../../assets/img/icon_add.svg?react";

type Props = {
  ingredients: IIngredient[];
  addIngredient: (ingredient: IIngredient) => void;
  removeIngredient: (name: string) => void;
};

function IngredienInput({
  ingredients,
  addIngredient,
  removeIngredient,
}: Props) {
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");

  function handleAddIngredient() {
    if (currentIngredient.trim() === "" || currentAmount.trim() === "") return;
    const ingredient: IIngredient = {
      name: currentIngredient,
      amount: currentAmount,
    };
    addIngredient(ingredient);
    setCurrentIngredient("");
    setCurrentAmount("");
  }

  return (
    <div className="input-wrapper">
      <label htmlFor="ingredients">Ingredients</label>
      <div className="add-wrapper">
        <input
          id="ingredients"
          type="text"
          placeholder="Enter name"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
        />
        <input
          id="amount"
          type="text"
          placeholder="Enter amount"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
        />
        <button
          className="icon-button"
          type="button"
          onClick={handleAddIngredient}
        >
          <IconAdd />
        </button>
      </div>
      {ingredients && (
        <IngredientList
          ingredients={ingredients}
          removeIngredient={removeIngredient}
        />
      )}
    </div>
  );
}
export default IngredienInput;
