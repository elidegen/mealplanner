import "./Footer.css";
import IconList from "../../assets/img/icon_list.svg?react";
import IconCalendar from "../../assets/img/icon_calendar.svg?react";
import IconAdd from "../../assets/img/icon_add.svg?react";
import IconBurger from "../../assets/img/icon_burger.svg?react";
import IconGear from "../../assets/img/icon_gear.svg?react";
import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <footer className="navigation">
      <Link className="nav-button" to="/lists">
        <IconList></IconList>
      </Link>

      <Link className="nav-button" to="/calendar">
        <IconCalendar></IconCalendar>
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
