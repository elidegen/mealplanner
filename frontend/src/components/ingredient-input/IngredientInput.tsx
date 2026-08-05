import { useState } from "react";
import type { IIngredient } from "../../types/MealTypes";
import IngredientList from "../ingredient-list/IngredientList";
import IconAdd from "../../assets/img/icon_add.svg?react";
import { extractAmountUnit } from "../../helper/meal.helper";

type Props = {
  ingredients: IIngredient[];
  addIngredient: (ingredient: IIngredient) => void;
  removeIngredient: (name: string, unit: string) => void;
  isError: boolean;
};

function IngredienInput({
  ingredients,
  addIngredient,
  removeIngredient,
  isError,
}: Props) {
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  function handleAddIngredient() {
    const isNameValid = currentIngredient.trim() !== "";
    const parsedAmount = extractAmountUnit(currentAmount);
    const isAmountValid = parsedAmount !== null;

    setNameError(isNameValid ? null : "Name is required!");
    setAmountError(
      isAmountValid ? null : 'Enter in format e.g: "200g" or "2tl"',
    );
    if (!isNameValid || !isAmountValid) return;

    const ingredient: IIngredient = {
      name: currentIngredient,
      amount: parsedAmount.value,
      unit: parsedAmount.unit,
    };
    addIngredient(ingredient);
    setCurrentIngredient("");
    setCurrentAmount("");
  }

  return (
    <div className="input-wrapper">
      <label htmlFor="ingredients">Ingredients</label>
      <div className="add-wrapper">
        <div className="ingredient-field">
          <input
            id="ingredients"
            type="text"
            placeholder="Enter name"
            className={nameError || isError ? "input-error" : ""}
            value={currentIngredient}
            onChange={(e) => {
              setCurrentIngredient(e.target.value);
              if (nameError) setNameError(null);
            }}
          />
        </div>
        <div className="amount-field">
          <input
            id="amount"
            type="text"
            placeholder="Enter amount"
            className={amountError || isError ? "input-error" : ""}
            value={currentAmount}
            onChange={(e) => {
              setCurrentAmount(e.target.value);
              if (amountError) setAmountError(null);
            }}
          />
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={handleAddIngredient}
        >
          <IconAdd />
        </button>
      </div>
      {nameError && <span className="error-message">{nameError}</span>}
      {amountError && <span className="error-message">{amountError}</span>}
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
