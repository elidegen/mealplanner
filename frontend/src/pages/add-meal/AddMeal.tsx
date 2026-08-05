import { useState } from "react";
import "./AddMeal.css";
import type { IIngredient, IMacros, IMeal, ITag } from "../../types/MealTypes";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import { apiFetch } from "../../auth/api";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import Snackbar from "../../components/snackbar/Snackbar";
import MacroInput from "../../components/macro-input/MacroInput";
import IngredientInput from "../../components/ingredient-input/IngredientInput";
import TagInput from "../../components/tag-input/TagInput";

function AddMeal() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [tags, setTags] = useState<ITag[]>([]);
  const [portions, setPortions] = useState<number>(1);
  const [macros, setMacros] = useState<IMacros | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    id: number;
    text: string;
    color: string;
  } | null>(null);

  function addIngredient(ingredient: IIngredient) {
    setIngredients((prev) => [...prev, ingredient]);
    setIngredientsError(null);
  }

  function removeIngredient(name: string) {
    setIngredients((prev) => prev.filter((ing) => ing.name !== name));
  }

  function addTag(tag: ITag) {
    setTags((prev) => [...prev, tag]);
  }

  function removeTag(name: string) {
    setTags((prev) => prev.filter((ing) => ing.name !== name));
  }

  function addMacros(macros: IMacros) {
    setMacros(macros);
  }

  function updateName(name: string) {
    setName(name);
    setNameError(null);
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError("Name is required!");
      return;
    }
    if (!ingredients.length) {
      setIngredientsError("Add at least one ingredient!");
      return;
    }
    if (!activeHome) {
      setSnackbar({
        id: Date.now(),
        text: "No home selected",
        color: "#dc2626",
      });
      return;
    }
    setLoading(true);
    const meal: IMeal & { homeId: number } = {
      name,
      ingredients,
      portions: portions ?? 1,
      public: false,
      tags: tags,
      macros: {
        proteins: macros ? macros.proteins : null,
        carbs: macros ? macros.carbs : null,
        fat: macros ? macros.fat : null,
        calories: macros ? macros.calories : null,
      },
      homeId: activeHome.id,
    };

    try {
      await apiFetch("/api/meals", {
        method: "POST",
        body: JSON.stringify(meal),
        token,
      });
      setName("");
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
              className={nameError ? "input-error" : ""}
              onChange={(e) => updateName(e.target.value)}
            />
            {nameError && <span className="error-message">{nameError}</span>}
          </div>
          <TagInput tags={tags} addTag={addTag} removeTag={removeTag} />
          <IngredientInput
            ingredients={ingredients}
            addIngredient={addIngredient}
            removeIngredient={removeIngredient}
            isError={ingredientsError !== null}
          />
          {ingredientsError && (
            <span className="error-message ingredient-error">
              {ingredientsError}
            </span>
          )}
          <MacroInput addMacros={addMacros} />

          <div className="input-wrapper">
            <label htmlFor="portions">Portions</label>
            <input
              id="portions"
              type="number"
              placeholder="Enter portions"
              value={portions}
              onChange={(e) => setPortions(e.target.valueAsNumber)}
            />
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
