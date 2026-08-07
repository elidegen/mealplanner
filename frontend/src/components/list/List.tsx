import type { IListItem } from "../../types/ListTypes";
import ListItem from "../list-item/ListItem";
import "./List.css";

type Props = {
  li: IListItem[];
  propagateChecked: (item: IListItem) => void;
  propagateDelete: (item: IListItem) => void;
};

function List({ li, propagateChecked, propagateDelete }: Props) {
  return (
    <ul>
      {li.map((item) => (
        <ListItem
          key={item.id}
          item={item}
          propagateChecked={propagateChecked}
          propagateDelete={propagateDelete}
        ></ListItem>
      ))}
    </ul>
  );
}
export default List;
