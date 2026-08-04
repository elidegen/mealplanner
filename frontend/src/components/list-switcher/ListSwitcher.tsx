import TextButton from "../text-button/TextButton";
import { ListType } from "../../types/ListTypes";
import "./ListSwitcher.css";

type Props = {
  activeList: ListType;
  onSwitch: (list: ListType) => void;
};

function ListSwitcher({ activeList, onSwitch }: Props) {
  return (
    <div className="list-switcher-wrapper">
      <TextButton
        text="Shopping"
        onClicked={() => onSwitch(ListType.Shopping)}
        selected={activeList === ListType.Shopping}
      />
      <TextButton
        text="Pantry"
        onClicked={() => onSwitch(ListType.Pantry)}
        selected={activeList === ListType.Pantry}
      />
    </div>
  );
}

export default ListSwitcher;
