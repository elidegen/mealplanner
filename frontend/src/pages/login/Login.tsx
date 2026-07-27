import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextButton from "../../components/text-button/TextButton";
import { useAuth } from "../../auth/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    setError(null);
    if (!email.includes("@") || !email.includes(".")) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein");
      return;
    }
    if (password === "") {
      setError("Bitte gib dein Passwort ein");
      return;
    }
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate("/meals");
    } catch {
      setError("Ungültige E-Mail oder Passwort");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <h1>Login</h1>
      <div className="login-form">
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        {loading && <p>Lädt...</p>}
        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Angemeldet bleiben
        </label>
        <TextButton
          text="Anmelden"
          onClicked={handleLogin}
          disabled={email === "" || password === "" || loading}
        />
        <Link to="/register">Noch kein Konto? Registrieren</Link>
      </div>
    </div>
  );
}

export default Login;