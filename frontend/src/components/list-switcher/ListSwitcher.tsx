import TextButton from "../text-button/TextButton";
import "./ListSwitcher.css";

type Props = {
  activeList: "shopping" | "pantry";
  onSwitch: (list: "shopping" | "pantry") => void;
};

function ListSwitcher({ activeList, onSwitch }: Props) {
  return (
    <div className="list-switcher-wrapper">
      <TextButton
        text="Shopping"
        onClicked={() => onSwitch("shopping")}
        selected={activeList === "shopping"}
      />
      <TextButton
        text="Pantry"
        onClicked={() => onSwitch("pantry")}
        selected={activeList === "pantry"}
      />
    </div>
  );
}

export default ListSwitcher;
