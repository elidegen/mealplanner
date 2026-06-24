import { useState } from "react";
import type { IMeal } from "../../types/ListTypes";
import "./Meals.css";

type Tab = "Recipes" | "MealBrowser";

const RECIPES: IMeal[] = [
  { title: "Lachsfilet", ingredients: ["200g Lachs", "2 EL Butter", "Salz", "Pfeffer", "Zitrone"] },
  { title: "Rice Porridge", ingredients: ["200g Reis", "500ml Wasser", "Salz", "Ingwer"] },
  { title: "Döner", ingredients: ["Fladenbrot", "Hähnchenfleisch", "Salat", "Tomate", "Soße"] },
  { title: "Hähnchen mit Gemüse", ingredients: ["400g Hähnchen", "Brokkoli", "Karotten", "Knoblauch"] },
];

const MEAL_BROWSER: IMeal[] = [
  { title: "Lasagne", ingredients: ["Lasagneplatten", "Hackfleisch", "Tomatensauce", "Béchamel", "Käse"] },
  { title: "Pizza Quattro Formaggi", ingredients: ["Pizzateig", "Mozzarella", "Gorgonzola", "Parmesan", "Ricotta"] },
  { title: "Reis mit Hähnchen", ingredients: ["300g Reis", "400g Hähnchen", "Zwiebeln", "Paprika"] },
  { title: "Nudeln mit Pesto", ingredients: ["400g Nudeln", "Basilikum-Pesto", "Parmesan", "Kirschtomaten"] },
  { title: "Griechischer Salat", ingredients: ["Gurke", "Tomate", "Feta", "Oliven", "Olivenöl"] },
  { title: "Rührei", ingredients: ["4 Eier", "Butter", "Salz", "Schnittlauch"] },
];

function Meals() {
  const [activeTab, setActiveTab] = useState<Tab>("Recipes");
  const list = activeTab === "Recipes" ? RECIPES : MEAL_BROWSER;

  return (
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
          <div key={meal.title} className="meal">
            {meal.image && (
              <img src={meal.image} className="mealboximg" alt={meal.title} />
            )}
            <div className="displayFlex">
              <h2>{meal.title}</h2>
              {meal.ingredients.map((ing) => (
                <span key={ing}>-{ing}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Meals;
