import { useState } from "react";
import type { IListItem } from "../../types/ListTypes";
import TextButton from "../text-button/TextButton";
import { extractAmountUnit } from "../../helper/meal.helper";
import "./AddToList.css";

type Props = {
  addFunction: (item: IListItem) => void;
};
function AddToList({ addFunction }: Props) {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  function buildItem() {
    // Das Feld war hier schon immer optional, deshalb 0 / "" statt einer Fehlermeldung
    const parsed = extractAmountUnit(amount);
    addFunction({
      id: name + amount,
      name: name,
      amount: parsed?.value ?? 0,
      unit: parsed?.unit ?? "",
      checked: false,
    });
    setName("");
    setAmount("");
  }

  return (
    <div className="add-item-wrapper">
      <input
        className="input-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item"
      />
      <input
        className="input-amount"
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <TextButton text="Add" onClicked={buildItem}></TextButton>
    </div>
  );
}

export default AddToList;
