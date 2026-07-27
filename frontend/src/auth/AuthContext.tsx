import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

type User = { id: number; email: string; name: string };

type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Direkt beim ersten Render aus dem localStorage lesen, nicht per useEffect:
  // sonst ist isAuthenticated im ersten Render false und ProtectedRoute
  // leitet auf /login um, bevor der gespeicherte Token wiederhergestellt ist.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? (JSON.parse(saved) as User) : null;
  });

  async function login(email: string, password: string, rememberMe = false) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json() as { token: string; user: User };
    setToken(data.token);
    setUser(data.user);
    if (rememberMe) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: !!token }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth nur innerhalb von AuthProvider");
  return ctx;
}
