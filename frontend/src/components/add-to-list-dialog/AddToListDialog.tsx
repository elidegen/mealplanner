import type { IMeal } from "../../types/MealTypes";
import IconClose from "../../assets/img/icon_close.svg?react";
import IconListAdd from "../../assets/img/icon_list_add.svg?react";
import { useState } from "react";
import "./AddToListDialog.css";

type Props = {
  vars: {
    mealToAdd: IMeal | null;
    addToListDialogOpen: boolean;
  };
  functions: {
    closeAddToListDialog: () => void;
    addToList: (meal: IMeal, portions: number) => Promise<void>;
  };
};

function AddToListDialog({ vars, functions }: Props) {
  // Das Rezept selbst ist die naheliegendste Menge, deshalb als Vorgabe
  const [amount, setAmount] = useState<number | undefined>(
    vars.mealToAdd?.portions,
  );
  const [portionError, setPortionError] = useState<string | null>(null);

  function getPortionsText() {
    const portions = vars.mealToAdd!.portions;
    if (portions > 0)
      return `Recipe amounts are for ${portions} ${portions === 1 ? "portion" : "portions"}`;
    else return "Recipe has no portion size set";
  }

  function handleAddToList() {
    if (!amount) {
      setPortionError("Choose how many portions to add!");
      return;
    }
    if (amount < 0) {
      setPortionError("Cannot add negative portions!");
      return;
    }
    functions.addToList(vars.mealToAdd!, amount);
  }

  function handleAmountInput(amount: number) {
    if (amount > 0) setPortionError("");
    setAmount(amount);
  }

  return (
    <>
      <div
        className="popup-overlay"
        onClick={() => functions.closeAddToListDialog()}
      >
        <div className="popup" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-content">
            <button
              className="close-button"
              type="button"
              onClick={() => functions.closeAddToListDialog()}
            >
              <IconClose />
            </button>

            <p className="meal-name">{vars.mealToAdd!.name}</p>
            <p className="popup-text">
              How many portions do you wish to add to your shopping list?
            </p>
            <p className="popup-text">{getPortionsText()}</p>
            <div className="input-wrapper">
              <input
                id="amount"
                type="number"
                placeholder="Portions amount"
                className="form-control"
                value={amount}
                onChange={(e) => handleAmountInput(e.target.valueAsNumber)}
              />
              <button
                className="add-button icon-button"
                type="button"
                onClick={() => handleAddToList()}
              >
                <IconListAdd />
              </button>
            </div>
            {portionError && (
              <span className="error-message">{portionError}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddToListDialog;
