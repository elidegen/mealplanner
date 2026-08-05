import { useEffect, useRef, useState } from "react";
import { ListType, type IMeal } from "../../types/ListTypes";
import type { ITag } from "../../types/MealTypes";
import "./Meals.css";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import { apiFetch } from "../../auth/api";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import Snackbar from "../../components/snackbar/Snackbar";
import MealCard from "../../components/meal-card/MealCard";
import MealCardPopup from "../../components/meal-card-popup/MealCardPopup";
import MealsBar from "../../components/meals-bar/MealsBar";

export type Tab = "Recipes" | "MealBrowser";

const RECIPES: IMeal[] = [];

const MEAL_BROWSER: IMeal[] = [];

function Meals() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [activeTab, setActiveTab] = useState<Tab>("Recipes");
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [selectedTags, setSelectedTags] = useState<ITag[]>([]);
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
        // ergibt homeId=1&tags=vegan&tags=schnell
        const params = new URLSearchParams({ homeId: String(activeHome!.id) });
        selectedTags.forEach((tag) => params.append("tags", tag.name));

        const data = await apiFetch<IMeal[]>(`/api/meals?${params}`, {
          method: "GET",
          token,
        });
        setMeals(data);
      } catch (err) {
        console.log("err", err);

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
  }, [token, activeHome, selectedTags]);

  function switchActiveTab(tab: Tab) {
    setActiveTab(tab);
  }

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
              unit: ing.unit,
              list: ListType.Shopping,
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
    if (!activeHome) {
      setSnackbar({
        id: ++snackbarId.current,
        text: "No home selected",
        color: "#dc2626",
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        meal.ingredients.map((i) =>
          apiFetch<void>(`/api/lists/reduce-ingredient`, {
            method: "PATCH",
            body: JSON.stringify({
              name: i.name,
              amount: i.amount,
              unit: i.unit,
              list: ListType.Pantry,
              homeId: activeHome.id,
            }),
            token,
          }),
        ),
      );
      setSnackbar({
        id: ++snackbarId.current,
        text: `Cooking successful!`,
        color: "#16a34a",
      });
    } catch (err) {
      console.log("err", err);

      setSnackbar({
        id: ++snackbarId.current,
        text: "Cooking failed!",
        color: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
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
        <MealsBar
          activeTab={activeTab}
          switchActiveTab={switchActiveTab}
          selectedTags={selectedTags}
          updateSelectedTags={setSelectedTags}
        />
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
