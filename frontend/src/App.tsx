import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import LoadingSpinner from "./components/loading-spinner/LoadingSpinner";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import { useHome } from "./home/HomeContext";

// Jede Seite wird erst geladen, wenn sie zum ersten Mal aufgerufen wird.
// Vite legt daraus eigene Chunks an, das Start-Bundle enthaelt dann nur noch
// Grundgeruest, Header und Footer.
// Header, Footer und LoadingSpinner bleiben bewusst statisch: sie sind auf
// jeder Seite sichtbar, ein eigener Chunk waere hier nur ein Umweg.
const AddMeal = lazy(() => import("./pages/add-meal/AddMeal"));
const Lists = lazy(() => import("./pages/lists/Lists"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const Login = lazy(() => import("./pages/login/Login"));
const Users = lazy(() => import("./pages/users/Users"));
const Home = lazy(() => import("./pages/home/Home"));
const Meals = lazy(() => import("./pages/meals/Meals"));
const Register = lazy(() => import("./pages/register/Register"));
const FirstHome = lazy(() => import("./pages/first-home/FirstHome"));

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
          {/* Umschliesst auch FirstHome, das AppContent ausserhalb von
              <Routes> zurueckgibt - sonst fehlt dort die Fallback-Anzeige,
              waehrend der Chunk geladen wird. */}
          <Suspense fallback={<LoadingSpinner visible={true} />}>
            <AppContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
