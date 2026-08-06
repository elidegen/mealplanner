import { useEffect, useRef, useState } from "react";
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
import { addOrMergeIngredient, ingredientKey } from "../../helper/meal.helper";
import { useNavigate, useParams } from "react-router-dom";

function AddMeal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editMode = id ? true : false;
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [tags, setTags] = useState<ITag[]>([]);
  // Leeres Zahlenfeld liefert NaN, deshalb null statt einer Zahl
  const [portions, setPortions] = useState<number | null>(1);
  const [portionsError, setPortionsError] = useState<string | null>(null);
  const [macros, setMacros] = useState<IMacros | null>(null);
  const [loading, setLoading] = useState(false);
  // Laesst sich das Meal nicht laden, gibt es nichts zu bearbeiten - dann
  // ersetzt eine Meldung die Form, statt einen Save-Button anzubieten,
  // der zwangslaeufig in denselben Fehler laeuft
  const [loadError, setLoadError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    id: number;
    text: string;
    color: string;
  } | null>(null);
  const snackbarId = useRef(0);

  function prefill(meal: IMeal) {
    setName(meal.name);
    setIngredients(meal.ingredients);
    setTags(meal.tags);
    setPortions(meal.portions);
    setMacros(meal.macros);
  }

  function resetForm() {
    setName("");
    setIngredients([]);
    setTags([]);
    setPortions(1);
    setMacros(null);
  }

  useEffect(() => {
    if (!editMode || !activeHome) return;
    async function init() {
      setLoading(true);
      try {
        const meal = await apiFetch(
          `/api/meals/${id}?homeId=${activeHome?.id}`,
          {
            method: "GET",
            token,
          },
        );
        prefill(meal as IMeal);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load meal",
        );
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [activeHome, editMode, id, token]);

  // Gibt es die Zutat mit derselben Einheit schon, wächst dort nur die Menge —
  // die Liste zeigt die Änderung sofort
  function addIngredient(ingredient: IIngredient) {
    setIngredients((prev) => addOrMergeIngredient(prev, ingredient));
    setIngredientsError(null);
  }

  // Über denselben Schlüssel wie beim Hinzufügen, damit genau der Eintrag
  // verschwindet, auf dessen X geklickt wurde — und nicht die gleichnamige
  // Zutat mit anderer Einheit
  function removeIngredient(name: string, unit: string) {
    const key = ingredientKey(name, unit);
    setIngredients((prev) =>
      prev.filter((ing) => ingredientKey(ing.name, ing.unit) !== key),
    );
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

  function updatePortions(portions: number) {
    setPortions(Number.isNaN(portions) ? null : portions);
    setPortionsError(null);
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
    if (portions === null) {
      setPortionsError("Portions are required!");
      return;
    }
    if (portions <= 0) {
      setPortionsError("Portions must be greater than 0!");
      return;
    }
    if (!activeHome) {
      setSnackbar({
        id: ++snackbarId.current,
        text: "No home selected",
        color: "#dc2626",
      });
      return;
    }
    setLoading(true);
    const meal: IMeal & { homeId: number } = {
      name,
      ingredients,
      portions,
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

    if (editMode) {
      updateMeal(meal);
    } else {
      saveMeal(meal);
    }
  }

  async function updateMeal(meal: IMeal) {
    try {
      await apiFetch(`/api/meals/${id}`, {
        method: "PUT",
        body: JSON.stringify(meal),
        token,
      });
      // Anders als beim Anlegen bleiben die Werte stehen: der User bearbeitet
      // dasselbe Meal weiter und sieht, was gespeichert wurde
      setSnackbar({
        id: ++snackbarId.current,
        text: "Meal updated successfully!",
        color: "#16a34a",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error while updated";
      setSnackbar({ id: Date.now(), text: message, color: "#dc2626" });
    } finally {
      setLoading(false);
    }
  }

  async function saveMeal(meal: IMeal) {
    try {
      await apiFetch("/api/meals", {
        method: "POST",
        body: JSON.stringify(meal),
        token,
      });
      resetForm();
      setSnackbar({
        id: ++snackbarId.current,
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

  if (loadError) {
    return (
      <div className="add-meal-page">
        <div className="load-error">
          <p>{loadError}</p>
          <button
            className="default-button"
            type="button"
            onClick={() => navigate("/meals")}
          >
            Back to meals
          </button>
        </div>
      </div>
    );
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
          <MacroInput macros={macros} addMacros={addMacros} />

          <div className="input-wrapper">
            <label htmlFor="portions">Portions</label>
            <input
              id="portions"
              type="number"
              placeholder="Enter portions"
              className={portionsError ? "input-error" : ""}
              value={portions ?? ""}
              onChange={(e) => updatePortions(e.target.valueAsNumber)}
            />
            {portionsError && (
              <span className="error-message">{portionsError}</span>
            )}
          </div>
          <button className="default-button" type="button" onClick={handleSave}>
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

// /add-meal und /add-meal/:id rendern denselben Komponententyp an derselben
// Stelle im Baum - ohne key wuerde React die Instanz samt State weiterverwenden
// und beim Wechsel die Felder des zuletzt geladenen Meals stehen lassen
function AddMealPage() {
  const { id } = useParams();
  return <AddMeal key={id ?? "new"} />;
}

export default AddMealPage;
