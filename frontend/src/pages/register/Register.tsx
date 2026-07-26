import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextButton from "../../components/text-button/TextButton";
import { useAuth } from "../../auth/AuthContext";
import "./Register.css";

function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleRegister() {
    setError(null);
    if (name.trim() === "") {
        setError("Bitte gib deinen Namen ein");
    return;
    }
    if (!email.includes("@") || !email.includes(".")) {
        setError("Bitte gib eine gültige E-Mail-Adresse ein");
    return;
    }
    if (password.length < 8) {
        setError("Das Passwort muss mindestens 8 Zeichen lang sein");
    return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
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
      <h1>Registrieren</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <TextButton
          text="Registrieren"
          onClicked={handleRegister}
          disabled={name === "" || email === "" || password === "" || loading}
        />
        <Link to="/login">Schon ein Konto? Anmelden</Link>
      </div>
    </div>
  );
}

export default Register;