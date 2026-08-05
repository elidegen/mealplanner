import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import type { IHome } from "../types/HomeTypes";

type HomeContextValue = {
  homes: IHome[];
  activeHome: IHome | null;
  setActiveHome: (home: IHome) => void;
  createHome: (name: string) => Promise<void>;
  joinHome: (code: string) => Promise<void>;
  refreshHomes: () => Promise<void>;
  loading: boolean;
};

const HomeContext = createContext<HomeContextValue | null>(null);

export function HomeProvider({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();
  const [homes, setHomes] = useState<IHome[]>([]);
  const [activeHome, setActiveHomeState] = useState<IHome | null>(null);
  const [loading, setLoading] = useState(true);

  // Lädt die Homes neu. Das aktive Home bleibt erhalten, bekommt aber seine
  // aktuelle Rolle mit — wichtig, wenn man selbst befördert oder degradiert wurde.
  async function refreshHomes() {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/homes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Abgelaufenes oder ungültiges Token: ausloggen statt mit leerem State
      // weiterzulaufen, sonst zeigt die App geschützte Seiten ohne Daten.
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as IHome[];
      setHomes(data);
      setActiveHomeState((current) => {
        const still = current ? data.find((h) => h.id === current.id) : null;
        return still ?? data[0] ?? null;
      });
    } catch {
      setHomes([]);
      setActiveHomeState(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshHomes();
  }, [token]);

  function setActiveHome(home: IHome) {
    setActiveHomeState(home);
  }

  async function createHome(name: string) {
    const res = await fetch("/api/homes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Could not create home");
    const home = (await res.json()) as IHome;
    const newHome = { ...home, role: "admin" };
    setHomes((prev) => [...prev, newHome]);
    setActiveHome(newHome);
  }

  async function joinHome(code: string) {
    const res = await fetch("/api/homes/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      // Das Backend liefert eine konkrete Meldung (falscher Code, schon Mitglied)
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Could not join home");
    }
    const home = (await res.json()) as IHome;
    setHomes((prev) => [...prev, home]);
    setActiveHome(home);
  }

  return (
    <HomeContext.Provider
      value={{
        homes,
        activeHome,
        setActiveHome,
        createHome,
        joinHome,
        refreshHomes,
        loading,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHome nur innerhalb von HomeProvider");
  return ctx;
}
