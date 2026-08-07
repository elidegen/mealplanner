import type { IMeal } from "../../types/MealTypes";
import IconClose from "../../assets/img/icon_close.svg?react";
import IconCookpot from "../../assets/img/icon_cookpot.svg?react";
import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../loading-spinner/LoadingSpinner";
import { apiFetch } from "../../auth/api";
import { onEnter } from "../../helper/form.helper";
import { useAuth } from "../../auth/AuthContext";
import Snackbar from "../snackbar/Snackbar";
import "./CookDialog.css";
import { useHome } from "../../home/HomeContext";

type Props = {
  vars: {
    mealToCook: IMeal | null;
    cookDialogOpen: boolean;
  };
  functions: {
    closeCookDialog: () => void;
    cook: (meal: IMeal, portions: number) => Promise<void>;
  };
};

function CookDialog({ vars, functions }: Props) {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [portionError, setPortionError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>();
  const [calcAmount, setCalcAmount] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<{
    id: number;
    text: string;
    color: string;
  } | null>(null);
  const snackbarId = useRef(0);

  useEffect(() => {
    if (!activeHome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    async function fetchPortionsAmount() {
      try {
        const res = await apiFetch<{ portions: number }>(
          `/api/meals/${vars.mealToCook!.id}/portions-amount?homeId=${activeHome?.id}`,
          {
            method: "GET",
            token,
          },
        );

        setCalcAmount(res.portions);
        setAmount(res.portions);
      } catch (err) {
        console.log("err", err);

        setSnackbar({
          id: ++snackbarId.current,
          text:
            err instanceof Error ? err.message : "Failed to calculate portions",
          color: "#dc2626",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPortionsAmount();
  }, [token, activeHome, vars.mealToCook]);

  function getAmountText() {
    // 0 ist ein gueltiges Ergebnis - nur undefined heisst, dass die Abfrage
    // fehlgeschlagen ist. Ein blosses if (calcAmount) wuerde beides vermischen.
    if (calcAmount === undefined) return "Could not calculate portions...";
    return `Your pantry allows for up to ${calcAmount} ${
      calcAmount === 1 ? "portion" : "portions"
    }`;
  }

  function handleCook() {
    if (!amount) {
      setPortionError("Choose how many portions to cook!");
      return;
    }
    if (amount < 0) {
      setPortionError("Cannot cook negative meals dumbass!");
      return;
    }
    functions.cook(vars.mealToCook!, amount);
  }

  function handleAmountInput(amount: number) {
    if (amount > 0) setPortionError("");
    setAmount(amount);
  }

  return (
    <>
      <div
        className="popup-overlay"
        onClick={() => functions.closeCookDialog()}
      >
        <div className="popup" onClick={(e) => e.stopPropagation()}>
          {!isLoading && (
            <div className="dialog-content">
              <button
                className="close-button nav-button"
                type="button"
                onClick={() => functions.closeCookDialog()}
              >
                <IconClose />
              </button>

              <p className="meal-name">{vars.mealToCook!.name}</p>
              <p className="popup-text">
                How many portions do you wish to cook?
              </p>
              <p className="popup-text">{getAmountText()}</p>
              <div className="input-wrapper">
                <input
                  id="amount"
                  type="number"
                  placeholder="Portions amount"
                  className="form-control"
                  value={amount}
                  onChange={(e) => handleAmountInput(e.target.valueAsNumber)}
                  onKeyDown={onEnter(handleCook)}
                />
                <button
                  className="cook-button icon-button"
                  type="button"
                  onClick={() => handleCook()}
                >
                  <IconCookpot />
                </button>
              </div>
              {portionError && (
                <span className="error-message">{portionError}</span>
              )}
            </div>
          )}

          <LoadingSpinner visible={isLoading} />
          {snackbar && (
            <Snackbar
              key={snackbar.id}
              text={snackbar.text}
              color={snackbar.color}
              duration={3000}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default CookDialog;
