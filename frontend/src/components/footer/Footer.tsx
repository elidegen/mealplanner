import "./Footer.css";
import IconList from "../../assets/img/icon_list.svg?react";
import IconAdd from "../../assets/img/icon_add.svg?react";
import IconBurger from "../../assets/img/icon_burger.svg?react";
import IconGear from "../../assets/img/icon_gear.svg?react";
import { Link, useLocation } from "react-router-dom";
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

  return (
    <footer className="navigation">
      <Link className="nav-button" to="/lists">
        <IconList></IconList>
      </Link>

      <Link className="nav-button" to="/add-meal">
        <IconAdd></IconAdd>
      </Link>

      <Link className="nav-button" to="/meals">
        <IconBurger></IconBurger>
      </Link>

      <Link className="nav-button" to="/settings">
        <IconGear></IconGear>
      </Link>
    </footer>
  );
}

export default Footer;
