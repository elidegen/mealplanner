import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextButton from "../../components/text-button/TextButton";
import { useAuth } from "../../auth/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/meals");
    } catch {
      setError("Ungültige E-Mail oder Passwort");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await login(email, password);
      navigate("/meals");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registrierung fehlgeschlagen");
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
        <div className="login-buttons">
          <TextButton
            text="Anmelden"
            onClicked={handleLogin}
            disabled={email === "" || password === "" || loading}
          />
          <TextButton
            text="Registrieren"
            onClicked={handleRegister}
            disabled={email === "" || password === "" || loading}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
