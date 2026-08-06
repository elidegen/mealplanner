import IconListAdd from "../../assets/img/icon_list_add.svg?react";
import IconTrash from "../../assets/img/icon_trash.svg?react";
import IconClose from "../../assets/img/icon_close.svg?react";
import IconCookpot from "../../assets/img/icon_cookpot.svg?react";
import IconPublic from "../../assets/img/icon_public.svg?react";
import IconPublicOff from "../../assets/img/icon_public_off.svg?react";
import IconEdit from "../../assets/img/icon_edit.svg?react";
import TagList from "../tag-list/TagList";
import "./MealCardPopup.css";
import IngredientList from "../ingredient-list/IngredientList";
import MacroDisplay from "../macro-display/MacroDisplay";
import type { IMeal } from "../../types/MealTypes";
import { Link } from "react-router-dom";
import { useHome } from "../../home/HomeContext";

type Props = {
  mealPopup: { visible: boolean; meal: IMeal | null };
  functions: {
    closePopup: () => void;
    openAddToListDialog: (meal: IMeal) => void;
    deleteMeal: (meal: IMeal) => void;
    openCookDialog: (meal: IMeal) => void;
    togglePublic: (meal: IMeal) => void;
  };
};

function MealCardPopup({ mealPopup, functions }: Props) {
  const { activeHome } = useHome();
  if (!activeHome || !mealPopup.visible) return null;

  const meal = mealPopup.meal!;
  // Im Meal Browser stehen Meals fremder Homes die darf man ansehen, kochen und auf
  // die Einkaufsliste setzen, aber nicht bearbeiten, loeschen oder freigeben.
  // Das Backend lehnt das ohnehin mit 403 ab, der Button gehoert also weg
  const isOwnMeal = meal.homeId === activeHome.id;

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
      <div key={meal.id} className="popup" onClick={(e) => e.stopPropagation()}>
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
            onClick={() => functions.openAddToListDialog(meal)}
          >
            <IconListAdd />
          </button>
          <button
            className="nav-button"
            type="button"
            onClick={() => functions.openCookDialog(meal)}
          >
            <IconCookpot />
          </button>
          {isOwnMeal && (
            <>
              <Link to={`/add-meal/${meal.id}`}>
                <button className="nav-button" type="button">
                  <IconEdit />
                </button>
              </Link>
              <button
                className="nav-button"
                type="button"
                onClick={() => functions.togglePublic(meal)}
              >
                {meal.public ? <IconPublicOff /> : <IconPublic />}
              </button>
              <button
                className="nav-button"
                type="button"
                onClick={() => functions.deleteMeal(meal)}
              >
                <IconTrash />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default MealCardPopup;
