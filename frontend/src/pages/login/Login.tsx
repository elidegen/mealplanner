import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextButton from "../../components/text-button/TextButton";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  function handleLogin() {
    navigate("/add-meal");
  }

  function handleRegister() {
    console.log("Register clicked");
  }

  return (
    <div className="login-wrapper">
      <h1>Login</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="login-buttons">
          <TextButton
            text="Anmelden"
            onClicked={handleLogin}
            disabled={username === "" || password === ""}
          />
          <TextButton text="Registrieren" onClicked={handleRegister} />
        </div>
      </div>
    </div>
  );
}

export default Login;
