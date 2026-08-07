import { useState, useEffect } from "react";
import ListSwitcher from "../../components/list-switcher/ListSwitcher";
import List from "../../components/list/List";
import { ListType, type IListItem } from "../../types/ListTypes";
import AddToList from "../../components/add-to-list/AddToList";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import "./Lists.css";

type ListEntry = {
  id: number;
  name: string;
  amount: number;
  unit: string;
  homeId: number;
  list: ListType;
};

function Lists() {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [entries, setEntries] = useState<ListEntry[]>([]);
  const [activeList, setActiveList] = useState<ListType>(ListType.Shopping);
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
          amount: item.amount,
          unit: item.unit,
          list: activeList,
          homeId: activeHome.id,
        }),
      });
      if (!res.ok) throw new Error();
      // Gab es die Zutat schon, führt der Server sie zusammen und schickt den
      // bestehenden Eintrag mit erhöhter Menge zurück — dann ersetzen statt anhängen
      const saved = (await res.json()) as ListEntry;
      setEntries((prev) =>
        prev.some((e) => e.id === saved.id)
          ? prev.map((e) => (e.id === saved.id ? saved : e))
          : [...prev, saved],
      );
    } catch {
      setError("Could not save item");
    }
  }

  // Wird von zwei Wegen genutzt: Abhaken in der Pantry und manuelles Löschen
  async function deleteEntry(id: number) {
    const res = await fetch(`/api/lists/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error();
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // Abhaken: shopping -> wandert in die Pantry, pantry -> aufgebraucht, wird entfernt
  async function handleCheck(item: IListItem) {
    const id = Number(item.id);
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    setError(null);

    try {
      if (entry.list === ListType.Shopping) {
        const res = await fetch(`/api/lists/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ list: ListType.Pantry }),
        });
        if (!res.ok) throw new Error();
        // Liegt die Zutat in der Pantry schon, verschmelzen beide: removedId ist
        // dann der abgehakte Eintrag, entry der übrig gebliebene mit voller Menge
        const { entry: saved, removedId } = (await res.json()) as {
          entry: ListEntry;
          removedId: number | null;
        };
        setEntries((prev) =>
          prev
            .filter((e) => e.id !== removedId)
            .map((e) => (e.id === saved.id ? saved : e)),
        );
      } else {
        await deleteEntry(id);
      }
    } catch {
      setError("Could not save change");
    }
  }

  // Eintrag von Hand entfernen, ohne ihn vorher abzuhaken
  async function handleDelete(item: IListItem) {
    setError(null);
    try {
      await deleteEntry(Number(item.id));
    } catch {
      setError("Could not delete item");
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
      unit: e.unit,
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
        <List
          li={visible}
          propagateChecked={handleCheck}
          propagateDelete={handleDelete}
        />
      )}
      <AddToList addFunction={addToList} />
    </div>
  );
}

export default Lists;
