import type { IListItem } from "../../types/ListTypes";
import IconTrash from "../../assets/img/icon_trash.svg?react";
import "./ListItem.css";

type Props = {
  item: IListItem;
  propagateChecked: (item: IListItem) => void;
  propagateDelete: (item: IListItem) => void;
};

function ListItem({ item, propagateChecked, propagateDelete }: Props) {
  return (
    <li>
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => propagateChecked(item)}
        name={item.name}
        id={item.name + item.id}
      />
      <p onClick={() => propagateChecked(item)}>
        {item.name} {item.amount}
        {item.unit}
      </p>
      <button
        className="icon-button"
        title="Delete"
        onClick={() => propagateDelete(item)}
      >
        <IconTrash />
      </button>
    </li>
  );
}

export default ListItem;
