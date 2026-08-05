import { useState } from "react";
import "./Dropdown.css";
import type { IHome } from "../../types/HomeTypes";
import IconDropdownArrow from "../../assets/img/icon_dropdown_arrow.svg?react";

type Props = {
  homes: IHome[];
  activeHome: IHome | null;
  setActiveHome: (home: IHome) => void;
  labelText: string;
};

function Dropdown({ homes, activeHome, setActiveHome, labelText }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  function getDropdownBoxClass() {
    return dropdownOpen
      ? "dropdown-content expanded"
      : "dropdown-content collapsed";
  }

  return (
    <div className="dropdown-wrapper">
      <label htmlFor="dropdown-box">{labelText}</label>
      <div
        className="form-control"
        id="dropdown-box"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <p>{activeHome?.name}</p>
        <IconDropdownArrow />
        <div className={getDropdownBoxClass()}>
          {homes.map((home) => (
            <div
              className="dropdown-option"
              key={home.id}
              onClick={() => setActiveHome(home)}
            >
              <p>{home.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
