import IconInfo from "../../assets/img/icon_info.svg?react";
import type { IMeal } from "../../types/MealTypes";
import TagList from "../tag-list/TagList";

type Props = {
  meal: IMeal;
  openPopup: (meal: IMeal) => void;
};

function MealCard({ meal, openPopup }: Props) {
  return (
    <div key={meal.id} className="meal">
      <div className="displayFlex">
        <h2>{meal.name}</h2>
        {meal.tags && <TagList tags={meal.tags} />}
      </div>
      <div className="button-wrapper">
        <button
          className="nav-button"
          type="button"
          onClick={() => openPopup(meal)}
        >
          <IconInfo />
        </button>
      </div>
    </div>
  );
}

export default MealCard;
