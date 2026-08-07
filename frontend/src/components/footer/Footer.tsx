import "./Footer.css";
import IconList from "../../assets/img/icon_list.svg?react";
import IconAdd from "../../assets/img/icon_add.svg?react";
import IconBurger from "../../assets/img/icon_burger.svg?react";
import IconGear from "../../assets/img/icon_gear.svg?react";
import { NavLink, useLocation } from "react-router-dom";
import { useHome } from "../../home/HomeContext";

function Footer() {
  const location = useLocation();
  const { homes } = useHome();

  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    homes.length === 0
  ) {
    return null;
  }

  // NavLink erkennt den aktiven Pfad selbst, inklusive Unterpfaden wie
  // /add-meal/5. Nur "/" muss extra behandelt werden, weil dort ebenfalls
  // AddMeal gerendert wird (siehe App.tsx).
  const rootShowsAddMeal = location.pathname === "/";

  function navClass(isActive: boolean) {
    return isActive ? "nav-button active" : "nav-button";
  }

  return (
    <footer className="navigation">
      <NavLink className={({ isActive }) => navClass(isActive)} to="/lists">
        <IconList></IconList>
      </NavLink>

      <NavLink
        className={({ isActive }) => navClass(isActive || rootShowsAddMeal)}
        to="/add-meal"
      >
        <IconAdd></IconAdd>
      </NavLink>

      <NavLink className={({ isActive }) => navClass(isActive)} to="/meals">
        <IconBurger></IconBurger>
      </NavLink>

      <NavLink className={({ isActive }) => navClass(isActive)} to="/settings">
        <IconGear></IconGear>
      </NavLink>
    </footer>
  );
}

export default Footer;
