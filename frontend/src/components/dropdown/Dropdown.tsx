import { useId, useState } from "react";
import "./Dropdown.css";
import IconDropdownArrow from "../../assets/img/icon_dropdown_arrow.svg?react";

// Generisch, damit die Komponente nicht nur Homes anzeigen kann: der Aufrufer
// sagt ueber getLabel/getKey, wie ein Eintrag dargestellt und identifiziert wird.
type Props<T> = {
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;
  labelText?: string;
};

function Dropdown<T>({
  items,
  selected,
  onSelect,
  getLabel,
  getKey,
  labelText,
}: Props<T>) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  // Eigene id pro Instanz: das Dropdown steht z. B. in der Nutzerliste
  // mehrfach auf einer Seite, eine feste id waere dort doppelt vergeben.
  const boxId = useId();

  function getDropdownBoxClass() {
    return dropdownOpen
      ? "dropdown-content expanded"
      : "dropdown-content collapsed";
  }

  return (
    <div className="dropdown-wrapper">
      {labelText && <label htmlFor={boxId}>{labelText}</label>}
      <div
        className="form-control dropdown-box"
        id={boxId}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <p>{selected !== null ? getLabel(selected) : ""}</p>
        <IconDropdownArrow />
        <div className={getDropdownBoxClass()}>
          {items.map((item) => (
            <div
              className="dropdown-option"
              key={getKey(item)}
              onClick={() => onSelect(item)}
            >
              <p>{getLabel(item)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
