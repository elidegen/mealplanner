import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import AddMeal from "./pages/add-meal/AddMeal";
import Lists from "./pages/lists/Lists";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";
import Users from "./pages/users/Users";
import Home from "./pages/home/Home";
import Meals from "./pages/meals/Meals";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Register from "./pages/register/Register";
import { useAuth } from "./auth/AuthContext";
import { useHome } from "./home/HomeContext";
import FirstHome from "./pages/first-home/FirstHome";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { homes, loading } = useHome();

  if (isAuthenticated && !loading && homes.length === 0) {
    return <FirstHome />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<AddMeal />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route path="/add-meal/:id" element={<AddMeal />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
        <Route path="/meals" element={<Meals />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="wrapper">
        <Header />
        <main>
          <AppContent />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
