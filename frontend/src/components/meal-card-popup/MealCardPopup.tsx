import type { IMeal } from "../../types/ListTypes";
import IconListAdd from "../../assets/img/icon_list_add.svg?react";
import IconTrash from "../../assets/img/icon_trash.svg?react";
import IconClose from "../../assets/img/icon_close.svg?react";
import IconCookpot from "../../assets/img/icon_cookpot.svg?react";
import TagList from "../tag-list/TagList";
import "./MealCardPopup.css";
import IngredientList from "../ingredient-list/IngredientList";
import MacroDisplay from "../macro-display/MacroDisplay";

type Props = {
  mealPopup: { visible: boolean; meal: IMeal | null };
  functions: {
    closePopup: () => void;
    addToList: (meal: IMeal) => void;
    deleteMeal: (meal: IMeal) => void;
    cook: (meal: IMeal) => void;
  };
};

function MealCardPopup({ mealPopup, functions }: Props) {
  if (!mealPopup.visible) return null;

  const meal = mealPopup.meal!;

  const macrosAvailable = () => {
    return !!(
      meal.macros &&
      (meal.macros.calories ||
        meal.macros.proteins ||
        meal.macros.carbs ||
        meal.macros.fat)
    );
  };

  return (
    <div className="popup-overlay" onClick={() => functions.closePopup()}>
      <div key={meal.id} className="meal-popup">
        <div className="content-wrapper">
          <div>
            <h2>{meal.name}</h2>
          </div>

          {meal.ingredients && (
            <IngredientList ingredients={meal.ingredients} />
          )}

          {macrosAvailable() && <MacroDisplay macros={meal.macros!} />}

          {meal.tags && <TagList tags={meal.tags} />}
        </div>

        <div className="popup-button-wrapper">
          <button
            className="nav-button"
            type="button"
            onClick={() => functions.closePopup()}
          >
            <IconClose />
          </button>
          <button
            className="nav-button"
            type="button"
            onClick={() => functions.addToList(meal)}
          >
            <IconListAdd />
          </button>
          <button
            className="nav-button"
            type="button"
            onClick={() => functions.cook(meal)}
          >
            <IconCookpot />
          </button>
          <button
            className="nav-button"
            type="button"
            onClick={() => functions.deleteMeal(meal)}
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  );
}
export default MealCardPopup;
