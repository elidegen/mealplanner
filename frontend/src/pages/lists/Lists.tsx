import { useState, useEffect } from "react";
import ListSwitcher from "../../components/list-switcher/ListSwitcher";
import List from "../../components/list/List";
import type { IListItem } from "../../types/ListTypes";
import AddToList from "../../components/add-to-list/AddToList";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import "./Lists.css";

type ListName = "shopping" | "pantry";

type ListEntry = {
  id: number;
  name: string;
  amount: string;
  homeId: number;
  list: ListName;
};

function Lists() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [activeList, setActiveList] = useState<ListName>("shopping");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Einträge des aktiven Homes laden — bei Home-Wechsel erneut
  useEffect(() => {
    if (!activeHome || !token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/lists?homeId=${activeHome.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<ListEntry[]>;
      })
      .then(setEntries)
      .catch(() => setError("Could not load lists"))
      .finally(() => setLoading(false));
  }, [activeHome, token]);

  async function addToList(item: IListItem) {
    if (!activeHome) return;
    setError(null);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: item.name,
          amount: item.amount ?? "",
          list: activeList,
          homeId: activeHome.id,
        }),
      });
      if (!res.ok) throw new Error();
      const created = (await res.json()) as ListEntry;
      setEntries((prev) => [...prev, created]);
    } catch {
      setError("Could not save item");
    }
  }

  // Abhaken: shopping -> wandert in die Pantry, pantry -> aufgebraucht, wird entfernt
  async function handleCheck(item: IListItem) {
    const id = Number(item.id);
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    setError(null);

    try {
      if (entry.list === "shopping") {
        const res = await fetch(`/api/lists/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ list: "pantry" }),
        });
        if (!res.ok) throw new Error();
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, list: "pantry" } : e)),
        );
      } else {
        const res = await fetch(`/api/lists/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      setError("Could not save change");
    }
  }

  if (!activeHome) {
    return <p className="list-hint">No home selected.</p>;
  }

  const visible: IListItem[] = entries
    .filter((e) => e.list === activeList)
    .map((e) => ({
      id: String(e.id),
      name: e.name,
      amount: e.amount,
      checked: false,
    }));

  return (
    <div className="lists-wrapper">
      <ListSwitcher activeList={activeList} onSwitch={setActiveList} />
      {error && <p className="list-error">{error}</p>}
      {loading ? (
        <p className="list-hint">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="list-hint">This list is empty.</p>
      ) : (
        <List li={visible} propagateChecked={handleCheck} />
      )}
      <AddToList addFunction={addToList} />
    </div>
  );
}

export default Lists;
