import { useEffect, useRef, useState } from "react";
import type { IMeal } from "../../types/ListTypes";
import "./Meals.css";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import { apiFetch } from "../../auth/api";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import Snackbar from "../../components/snackbar/Snackbar";
import IconTrash from "../../assets/img/icon_trash.svg?react";
import IconListAdd from "../../assets/img/icon_list_add.svg?react";

type Tab = "Recipes" | "MealBrowser";

const RECIPES: IMeal[] = [];

const MEAL_BROWSER: IMeal[] = [];


function Meals() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [activeTab, setActiveTab] = useState<Tab>("Recipes");
  const [meals, setMeals] = useState<IMeal[]>([]);
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

  async function addToList(meal: IMeal) {
    console.log("addtolist");

    // setLoading(true);
    // try {
    //   await apiFetch<void>(`/api/meals/${meal.id}`, {
    //     method: "DELETE",
    //     token,
    //   });
    //   setMeals((prev) => prev.filter((m) => m.id !== meal.id));
    //   setSnackbar({
    //     id: ++snackbarId.current,
    //     text: "Meal deleted",
    //     color: "#16a34a",
    //   });
    // } catch (err) {
    //   const message =
    //     err instanceof Error ? err.message : "Deleting meal failed";
    //   setSnackbar({
    //     id: ++snackbarId.current,
    //     text: message,
    //     color: "#dc2626",
    //   });
    // } finally {
    //   setLoading(false);
    // }
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
            <div key={meal.id} className="meal">
              <div className="displayFlex">
                <h2>{meal.name}</h2>
                {meal.macros?.calories && (
                  <div>Calories: {meal.macros.calories}</div>
                )}
                {meal.ingredients.map((ing) => (
                  <span key={ing.name}>
                    - {ing.name} {ing.amount}
                  </span>
                ))}
              </div>
              <div className="button-wrapper">
                <button
                  className="nav-button"
                  type="button"
                  onClick={() => addToList(meal)}
                >
                  <IconListAdd />
                </button>

                <button
                  className="nav-button"
                  type="button"
                  onClick={() => deleteMeal(meal)}
                >
                  <IconTrash />
                </button>
              </div>
            </div>
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
    </>
  );
}

export default Meals;
