import "./Header.css";
import IconChefHat from "../../assets/img/icon_chef_hat.svg?react";
import IconLogin from "../../assets/img/icon_login.svg?react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function Header({ title }: { title?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header>
      <h1>{titles[location.pathname]}</h1>
      <IconChefHat />
      {isAuthenticated && (
        <button className="login-button nav-button" onClick={handleLogout}>
          <IconLogin />
        </button>
      )}
    </header>
  );
}

export default Header;
