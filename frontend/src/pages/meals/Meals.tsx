import { useEffect, useRef, useState } from "react";
import { ListType } from "../../types/ListTypes";
import type { IMeal, ITag } from "../../types/MealTypes";
import "./Meals.css";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import { apiFetch } from "../../auth/api";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import Snackbar from "../../components/snackbar/Snackbar";
import MealCard from "../../components/meal-card/MealCard";
import MealCardPopup from "../../components/meal-card-popup/MealCardPopup";
import MealsBar from "../../components/meals-bar/MealsBar";
import CookDialog from "../../components/cook-dialog/CookDialog";
import AddToListDialog from "../../components/add-to-list-dialog/AddToListDialog";

export type Tab = "Recipes" | "MealBrowser";

function Meals() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [activeTab, setActiveTab] = useState<Tab>("Recipes");
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [mealToCook, setMealToCook] = useState<IMeal | null>(null);
  const [cookDialogOpen, setCookDialogOpen] = useState<boolean>(false);
  const [mealToAdd, setMealToAdd] = useState<IMeal | null>(null);
  const [addToListDialogOpen, setAddToListDialogOpen] =
    useState<boolean>(false);
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

  useEffect(() => {
    // Als const, damit die Verengung auch in loadMeals gilt - bei
    // activeHome?.id direkt wuerde TypeScript sie in der Closure verwerfen
    const isRecipes = activeTab === "Recipes";
    const homeId = activeHome?.id;
    if (isRecipes && !homeId) return;

    async function loadMeals() {
      setLoading(true);
      try {
        // ergibt homeId=1&tags=vegan&tags=schnell
        const params = new URLSearchParams();
        // Recipes zeigt nur das eigene Home, der Meal Browser dagegen die
        // freigegebenen Meals aller Homes - dort waere homeId sinnlos
        if (isRecipes) params.set("homeId", String(homeId));
        selectedTags.forEach((tag) => params.append("tags", tag.name));

        const path = isRecipes ? "/api/meals" : "/api/meals/public";
        const data = await apiFetch<IMeal[]>(`${path}?${params}`, {
          method: "GET",
          token,
        });
        setMeals(data);
      } catch (err) {
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
  }, [token, activeHome, selectedTags, activeTab]);

  function switchActiveTab(tab: Tab) {
    setActiveTab(tab);
  }

  async function togglePublic(meal: IMeal) {
    setLoading(true);
    try {
      const updated = await apiFetch<IMeal>(`/api/meals/${meal.id}/public`, {
        method: "PATCH",
        body: JSON.stringify({ public: !meal.public }),
        token,
      });
      setMeals((prev) => prev.map((m) => (m.id === meal.id ? updated : m)));
      // Das Popup haelt eine eigene Kopie des Meals - ohne das hier zeigt es
      // weiter das alte Icon, obwohl die Liste schon aktuell ist
      setMealPopup((prev) =>
        prev.meal?.id === meal.id ? { ...prev, meal: updated } : prev,
      );
      setSnackbar({
        id: ++snackbarId.current,
        text: updated.public ? "Meal is now public" : "Meal is now private",
        color: "#16a34a",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not change visibility";
      setSnackbar({
        id: ++snackbarId.current,
        text: message,
        color: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  }

  async function addToList(meal: IMeal, portions: number) {
    if (!activeHome) {
      setSnackbar({
        id: ++snackbarId.current,
        text: "No home selected",
        color: "#dc2626",
      });
      return;
    }
    if (meal.ingredients.length === 0) return;

    // Die Rezeptmengen gelten fuer meal.portions, deshalb auf die
    // gewuenschte Portionszahl hochrechnen
    const factor = portions / (meal.portions > 0 ? meal.portions : 1);

    setLoading(true);
    try {
      await Promise.all(
        meal.ingredients.map((ing) =>
          apiFetch("/api/lists", {
            method: "POST",
            body: JSON.stringify({
              name: ing.name,
              // Gerundet, damit auf der Einkaufsliste keine Werte wie
              // 133.33333333333334 g landen
              amount: Math.round(ing.amount * factor * 100) / 100,
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
      setAddToListDialogOpen(false);
      setMealPopup({ visible: false, meal: null });
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
      setMealPopup({ visible: false, meal: null });
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

  function openCookDialog(meal: IMeal) {
    if (!meal) return;
    setMealToCook(meal);
    setCookDialogOpen(true);
  }

  function openAddToListDialog(meal: IMeal) {
    if (!meal) return;
    setMealToAdd(meal);
    setAddToListDialogOpen(true);
  }

  async function cook(meal: IMeal, portions: number) {
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
      // Das Backend skaliert die Zutaten selbst und zieht sie in einer
      // Transaktion ab, damit der Vorrat nicht halb verbucht stehen bleibt
      await apiFetch<{ portions: number }>(`/api/meals/${meal.id}/cook`, {
        method: "POST",
        body: JSON.stringify({
          portions,
          homeId: activeHome.id,
        }),
        token,
      });
      setSnackbar({
        id: ++snackbarId.current,
        text: `Cooked ${portions} ${portions === 1 ? "portion" : "portions"}!`,
        color: "#16a34a",
      });
      setCookDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cooking failed!";
      setSnackbar({
        id: ++snackbarId.current,
        text: message,
        color: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  }

  function closePopup() {
    setMealPopup({ visible: false, meal: null });
  }

  function closeCookDialog() {
    setCookDialogOpen(false);
    setMealToCook(null);
  }

  function closeAddToListDialog() {
    setAddToListDialogOpen(false);
    setMealToAdd(null);
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
          {meals.map((meal) => (
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
        functions={{
          closePopup,
          openAddToListDialog,
          deleteMeal,
          openCookDialog,
          togglePublic,
        }}
      />
      {cookDialogOpen && mealToCook && (
        <CookDialog
          functions={{ cook, closeCookDialog }}
          vars={{ mealToCook, cookDialogOpen }}
        />
      )}
      {addToListDialogOpen && mealToAdd && (
        <AddToListDialog
          functions={{ addToList, closeAddToListDialog }}
          vars={{ mealToAdd, addToListDialogOpen }}
        />
      )}
    </>
  );
}

export default Meals;
