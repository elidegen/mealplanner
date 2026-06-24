import { useState, useEffect } from "react";
import ListSwitcher from "../../components/list-switcher/ListSwitcher";
import List from "../../components/list/List";
import type { IListItem } from "../../types/ListTypes";
import AddToList from "../../components/add-to-list/AddToList";
import "./Lists.css";

const DUMMY_SHOPPING: IListItem[] = [
  { id: "1", name: "Brokkoli", amount: "200g", checked: false },
  { id: "2", name: "Rice", amount: "1000g", checked: false },
  { id: "3", name: "Eggs", amount: "10x", checked: false },
  { id: "4", name: "Potatoes", amount: "2kg", checked: false },
  { id: "5", name: "Chicken", amount: "400g", checked: false },
];

const DUMMY_PANTRY: IListItem[] = [
  { id: "6", name: "Cookies", amount: "1 Pack", checked: false },
  { id: "7", name: "Milk", amount: "1L", checked: false },
  { id: "8", name: "Butter", amount: "250g", checked: false },
  { id: "9", name: "Salmon", amount: "2 Filets", checked: false },
  { id: "10", name: "Beans", amount: "400g", checked: false },
];

function Lists() {
  const [shoppingList, setShoppingList] = useState<IListItem[]>(() => {
    const saved = localStorage.getItem("shoppingList");
    return saved ? JSON.parse(saved) : DUMMY_SHOPPING;
  });
  const [pantryList, setPantryList] = useState<IListItem[]>(() => {
    const saved = localStorage.getItem("pantryList");
    return saved ? JSON.parse(saved) : DUMMY_PANTRY;
  });
  const [activeList, setActiveList] = useState<"shopping" | "pantry">(
    "shopping",
  );

  useEffect(() => {
    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem("pantryList", JSON.stringify(pantryList));
  }, [pantryList]);

  const list = activeList === "shopping" ? shoppingList : pantryList;
  const setList = activeList === "shopping" ? setShoppingList : setPantryList;

  function handleSwitch(selected: "shopping" | "pantry") {
    setActiveList(selected);
  }

  function addToList(item: IListItem) {
    setList((prev) => [...prev, item]);
  }

  function handleCheck(item: IListItem) {}

  return (
    <div className="lists-wrapper">
      <ListSwitcher
        activeList={activeList}
        onSwitch={handleSwitch}
      ></ListSwitcher>
      <List li={list} propagateChecked={handleCheck}></List>
      <AddToList addFunction={addToList}></AddToList>
    </div>
  );
}
export default Lists;
