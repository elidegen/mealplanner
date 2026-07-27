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
      setError("Please enter a valid email address");
      return;
    }
    if (password === "") {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate("/meals");
    } catch {
      setError("Invalid email or password");
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        {loading && <p>Loading…</p>}
        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Stay signed in
        </label>
        <TextButton
          text="Sign in"
          onClicked={handleLogin}
          disabled={email === "" || password === "" || loading}
        />
        <Link to="/register">Don't have an account? Sign up</Link>
      </div>
    </div>
  );
}

export default Login;