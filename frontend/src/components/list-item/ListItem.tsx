import { useEffect, useState } from "react";
import type { IListItem } from "../../types/ListTypes";
import "./ListItem.css";

type Props = {
  item: IListItem;
  propagateChecked: (item: IListItem) => void;
};

function ListItem({ item, propagateChecked }: Props) {
  const [checked, setChecked] = useState(item.checked);
  useEffect(() => {
    propagateChecked(item);
  }, [item]);
  return (
    <>
      <li key={item.name + item.id}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          name={item.name}
          id={item.name + item.id}
        />
        <p onClick={() => setChecked(!checked)}>
          {item.name} {item.amount}
        </p>
      </li>
    </>
  );
}

export default ListItem;
