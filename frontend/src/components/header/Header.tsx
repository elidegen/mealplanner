import "./Header.css";
import IconChefHat from "../../assets/img/icon_chef_hat.svg?react";
import IconLogin from "../../assets/img/icon_login.svg?react";
import IconList from "../../assets/img/icon_list.svg?react";
import IconCalendar from "../../assets/img/icon_calendar.svg?react";
import IconBurger from "../../assets/img/icon_burger.svg?react";
import IconGear from "../../assets/img/icon_gear.svg?react";
import IconHouse from "../../assets/img/icon_house.svg?react";
import IconUsers from "../../assets/img/icon_users.svg?react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";

type PageInfo = { title: string; Icon: React.FC };

// Titel und passendes Icon pro Route an einer Stelle
const PAGES: Record<string, PageInfo> = {
  "/": { title: "Add Meal", Icon: IconChefHat },
  "/add-meal": { title: "Add Meal", Icon: IconChefHat },
  "/add-meal/:id": { title: "Add Meal", Icon: IconChefHat },
  "/meals": { title: "Meals", Icon: IconBurger },
  "/lists": { title: "Lists", Icon: IconList },
  "/calendar": { title: "Calendar", Icon: IconCalendar },
  "/settings": { title: "Settings", Icon: IconGear },
  "/home": { title: "Home", Icon: IconHouse },
  "/users": { title: "Members", Icon: IconUsers },
};

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { homes } = useHome();

  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    (isAuthenticated && homes.length === 0)
  ) {
    return null;
  }

  const page = Object.entries(PAGES).find(([pattern]) =>
    matchPath(pattern, location.pathname),
  )?.[1];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header>
      <h1>{page?.title}</h1>
      {page && <page.Icon />}
      {isAuthenticated && (
        <button className="login-button nav-button" onClick={handleLogout}>
          <IconLogin />
        </button>
      )}
    </header>
  );
}

export default Header;
