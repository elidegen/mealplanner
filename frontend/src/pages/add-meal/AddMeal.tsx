import { useState } from "react";
import IconAdd from "../../assets/img/icon_add.svg?react";
import "./AddMeal.css";

function AddMeal() {
  const [meal, setMeal] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);

  function addIngredient() {
    if (currentIngredient === "") return;
    setIngredients((prev) => [...prev, currentIngredient]);
    setCurrentIngredient("");
  }

  function handleSave() {
    setMeal("");
    setCalories("");
    setIngredients([]);
  }

  return (
    <div className="add-meal-page">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="input-wrapper">
          <label htmlFor="Meal">Meal</label>
          <input
            id="meal"
            type="text"
            placeholder="Enter a meal"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="calories">Calories</label>
          <input
            id="calories"
            type="number"
            placeholder="Enter calories amount"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="ingredients">Ingredients</label>
          <div className="ingredient-wrapper">
            <input
              id="ingredients"
              type="text"
              placeholder="Add ingredients"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
            />
            <button className="add-item" type="button" onClick={addIngredient}>
              <IconAdd />
            </button>
          </div>
          <ul className="ingredients-list">
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <button className="default-button" onClick={handleSave}>
          Save
        </button>
      </form>
    </div>
  );
}

export default AddMeal;
