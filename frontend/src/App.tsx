import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import AddMeal from "./pages/add-meal/AddMeal";
import Lists from "./pages/lists/Lists";
import Calendar from "./pages/calendar/Calendar";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";
import Users from "./pages/users/Users";
import Home from "./pages/home/Home";
import Meals from "./pages/meals/Meals";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="wrapper">
        <Header title="Header" />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AddMeal />} />
              <Route path="/add-meal" element={<AddMeal />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<Users />} />
              <Route path="/meals" element={<Meals />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;