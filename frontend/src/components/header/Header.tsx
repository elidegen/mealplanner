import "./Header.css";
import IconChefHat from "../../assets/img/icon_chef_hat.svg?react";
import IconLogin from "../../assets/img/icon_login.svg?react";
import { Link, useLocation } from "react-router-dom";

function Header({ title }: { title?: string }) {
  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  }

  const titles: Record<string, string> = {
    "/": "Add Meal",
    "/add-meal": "Add Meal",
    "/lists": "Lists",
    "/settings": "Settings",
    "/calendar": "Calendar",
    "/home": "Home",
    "/meals": "Meals",
    "/users": "Users",
  };

  return (
    <header>
      <h1>{titles[location.pathname]}</h1>
      <IconChefHat></IconChefHat>

      <Link className="login-button nav-button" to="/login">
        <IconLogin></IconLogin>
      </Link>
    </header>
  );
}

export default Header;
