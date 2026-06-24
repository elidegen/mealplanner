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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// temporary token for dev
const DEV_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc4MjMzMjYxNSwiZXhwIjoxODEzODY4NjE1fQ.WOa0XkmZUzQawt5cD-uX5PwsPqZRadA4mI0lS53W32o";
const DEV_USER: User = { id: 2, email: "test@htwg.de", name: "Test" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(DEV_TOKEN);
  const [user, setUser] = useState<User | null>(DEV_USER);

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login fehlgeschlagen");
    const data = (await res.json()) as { token: string; user: User };
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
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
