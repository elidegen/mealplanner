import { useState } from "react";
import IconAdd from "../../assets/img/icon_add.svg?react";
import IconClose from "../../assets/img/icon_close.svg?react";
import "./AddMeal.css";
import type { IIngredient } from "./MealTypes";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import { apiFetch } from "../../auth/api";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import Snackbar from "../../components/snackbar/Snackbar";

function AddMeal() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [name, setName] = useState<string>("");
  const [calories, setCalories] = useState<number | null>(null);
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    id: number;
    text: string;
    color: string;
  } | null>(null);

  function addIngredient() {
    if (currentIngredient.trim() === "" || currentAmount.trim() === "") return;
    const ingredient: IIngredient = {
      name: currentIngredient,
      amount: currentAmount,
    };
    setIngredients((prev) => [...prev, ingredient]);
    setCurrentIngredient("");
    setCurrentAmount("");
  }

  function removeIngredient(name: string) {
    setIngredients((prev) => prev.filter((ing) => ing.name !== name));
  }

  async function handleSave() {
    if (!name.trim() || !ingredients.length) return;
    if (!activeHome) {
      setSnackbar({
        id: Date.now(),
        text: "Kein Home ausgewählt",
        color: "#dc2626",
      });
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/meals", {
        method: "POST",
        body: JSON.stringify({
          name,
          calories: calories ?? undefined,
          ingredients,
          homeId: activeHome.id,
          portions: 1,
        }),
        token,
      });
      setName("");
      setCalories(null);
      setIngredients([]);
      setSnackbar({
        id: Date.now(),
        text: "Meal saved successfully!",
        color: "#16a34a",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error while saving";
      setSnackbar({ id: Date.now(), text: message, color: "#dc2626" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="add-meal-page">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-wrapper">
            <label htmlFor="Name">Name</label>
            <input
              id="Name"
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="calories">Calories</label>
            <input
              id="calories"
              type="number"
              placeholder="Enter calories amount"
              value={calories ?? ""}
              onChange={(e) =>
                setCalories(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="ingredients">Ingredients</label>
            <div className="ingredient-wrapper">
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
                onClick={addIngredient}
              >
                <IconAdd />
              </button>
            </div>
            <ul className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name} {ingredient.amount}
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => removeIngredient(ingredient.name)}
                  >
                    <IconClose />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button className="default-button" onClick={handleSave}>
            Save
          </button>
        </form>
      </div>
      <LoadingSpinner visible={loading} />
      {snackbar && (
        <Snackbar
          key={snackbar.id}
          text={snackbar.text}
          color={snackbar.color}
          duration={3000}
        />
      )}
    </>
  );
}

export default AddMeal;
