import type { IListItem } from "../../types/ListTypes";
import "./ListItem.css";

type Props = {
  item: IListItem;
  propagateChecked: (item: IListItem) => void;
};

function ListItem({ item, propagateChecked }: Props) {
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
      </p>
    </li>
  );
}

export default ListItem;
