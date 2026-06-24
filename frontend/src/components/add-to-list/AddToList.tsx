import { useState } from "react";
import type { IListItem } from "../../types/ListTypes";
import TextButton from "../text-button/TextButton";
import "./AddToList.css";

type Props = {
  addFunction: (item: IListItem) => void;
};
function AddToList({ addFunction }: Props) {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  function buildItem() {
    addFunction({
      id: name + amount,
      name: name,
      amount: amount,
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
