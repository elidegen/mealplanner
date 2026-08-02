import { useEffect, useRef, useState } from "react";
import type { IMeal } from "../../types/ListTypes";
import "./Meals.css";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import { apiFetch } from "../../auth/api";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import Snackbar from "../../components/snackbar/Snackbar";
import MealCard from "../../components/meal-card/MealCard";
import MealCardPopup from "../../components/meal-card-popup/MealCardPopup";

type Tab = "Recipes" | "MealBrowser";

const RECIPES: IMeal[] = [];

const MEAL_BROWSER: IMeal[] = [];

function Meals() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [activeTab, setActiveTab] = useState<Tab>("Recipes");
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [mealPopup, setMealPopup] = useState<{
    visible: boolean;
    meal: IMeal | null;
  }>({
    visible: false,
    meal: null,
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    id: number;
    text: string;
    color: string;
  } | null>(null);
  const snackbarId = useRef(0);

  const list =
    meals.length > 0 ? meals : activeTab === "Recipes" ? RECIPES : MEAL_BROWSER;

  useEffect(() => {
    if (!activeHome) return;
    async function loadMeals() {
      setLoading(true);
      try {
        const data = await apiFetch<IMeal[]>(
          `/api/meals?homeId=${activeHome!.id}`,
          { method: "GET", token },
        );
        setMeals(data);
      } catch (err) {
        console.log("fehler", err);

        const message =
          err instanceof Error ? err.message : "Error while loading meals";
        setSnackbar({
          id: ++snackbarId.current,
          text: message,
          color: "#dc2626",
        });
      } finally {
        setLoading(false);
      }
    }
    loadMeals();
  }, [token, activeHome]);

  async function addToList(meal: IMeal) {
    if (!activeHome) {
      setSnackbar({
        id: ++snackbarId.current,
        text: "No home selected",
        color: "#dc2626",
      });
      return;
    }
    if (meal.ingredients.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(
        meal.ingredients.map((ing) =>
          apiFetch("/api/lists", {
            method: "POST",
            body: JSON.stringify({
              name: ing.name,
              amount: ing.amount,
              list: "shopping",
              homeId: activeHome.id,
            }),
            token,
          }),
        ),
      );
      const count = meal.ingredients.length;
      setSnackbar({
        id: ++snackbarId.current,
        text: `${count} ${count === 1 ? "ingredient" : "ingredients"} added to shopping list`,
        color: "#16a34a",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not add to shopping list";
      setSnackbar({
        id: ++snackbarId.current,
        text: message,
        color: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteMeal(meal: IMeal) {
    setLoading(true);
    try {
      await apiFetch<void>(`/api/meals/${meal.id}`, {
        method: "DELETE",
        token,
      });
      setMeals((prev) => prev.filter((m) => m.id !== meal.id));
      setSnackbar({
        id: ++snackbarId.current,
        text: "Meal deleted",
        color: "#16a34a",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Deleting meal failed";
      setSnackbar({
        id: ++snackbarId.current,
        text: message,
        color: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  }

  async function cook(meal: IMeal) {
    console.log("meal", meal);
  }

  function closePopup() {
    setMealPopup({ visible: false, meal: null });
  }

  function openPopup(meal: IMeal) {
    setMealPopup({ visible: true, meal: meal });
  }

  return (
    <>
      <div className="meals-page">
        <nav>
          <button
            className={`listbox ${activeTab === "Recipes" ? "selected" : ""}`}
            onClick={() => setActiveTab("Recipes")}
          >
            <span>Recipes</span>
          </button>
          <button
            className={`listbox ${activeTab === "MealBrowser" ? "selected" : ""}`}
            onClick={() => setActiveTab("MealBrowser")}
          >
            <span>Meal Browser</span>
          </button>
        </nav>
        <div className="list">
          {list.map((meal) => (
            <MealCard meal={meal} key={meal.id} openPopup={openPopup} />
          ))}
        </div>
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
      <MealCardPopup
        mealPopup={mealPopup}
        functions={{ closePopup, addToList, deleteMeal, cook }}
      />
    </>
  );
}

export default Meals;
