import type { Tab } from "../../pages/meals/Meals";
import type { ITag } from "../../types/MealTypes";
import IconFilter from "../../assets/img/icon_filter.svg?react";
import FilterPanel from "../filter-panel/FilterPanel";
import "./MealsBar.css";
import { useState } from "react";

type Props = {
  switchActiveTab: (tab: Tab) => void;
  activeTab: Tab;
  selectedTags: ITag[];
  updateSelectedTags: (tags: ITag[]) => void;
};

function MealsBar({
  switchActiveTab,
  activeTab,
  selectedTags,
  updateSelectedTags,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);

  function togglePanel() {
    setPanelOpen(!panelOpen);
  }

  return (
    <>
      <nav>
        <button
          className={`listbox ${activeTab === "Recipes" ? "selected" : ""}`}
          onClick={() => switchActiveTab("Recipes")}
        >
          <span>Recipes</span>
        </button>
        <button
          className={`listbox ${activeTab === "MealBrowser" ? "selected" : ""}`}
          onClick={() => switchActiveTab("MealBrowser")}
        >
          <span>Meal Browser</span>
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() => togglePanel()}
        >
          <IconFilter />
        </button>
      </nav>
      <div className={panelOpen ? "panel open" : "panel close"}>
        <FilterPanel
          selectedTags={selectedTags}
          updateSelectedTags={updateSelectedTags}
        />
      </div>
    </>
  );
}

export default MealsBar;
