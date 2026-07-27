import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

type Home = { id: number; name: string; role: string };

type HomeContextValue = {
  homes: Home[];
  activeHome: Home | null;
  setActiveHome: (home: Home) => void;
  createHome: (name: string) => Promise<void>;
  loading: boolean;
};

const HomeContext = createContext<HomeContextValue | null>(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);
  const [activeHome, setActiveHomeState] = useState<Home | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch("/api/homes", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Home[]) => {
        setHomes(data);
        if (data[0]) setActiveHomeState(data[0]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function setActiveHome(home: Home) {
    setActiveHomeState(home);
  }

  async function createHome(name: string) {
    const res = await fetch("/api/homes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Home erstellen fehlgeschlagen");
    const home = await res.json() as Home;
    const newHome = { ...home, role: "admin" };
    setHomes((prev) => [...prev, newHome]);
    setActiveHome(newHome);
  }

  return (
    <HomeContext.Provider value={{ homes, activeHome, setActiveHome, createHome, loading }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHome nur innerhalb von HomeProvider");
  return ctx;
}