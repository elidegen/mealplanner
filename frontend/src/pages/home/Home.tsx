import { useState } from "react";
import "./Home.css";
import { useHome } from "../../home/HomeContext";
import TextButton from "../../components/text-button/TextButton";

function Home() {
  const { homes, activeHome, setActiveHome, createHome } = useHome();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (name.trim() === "") { setError("Bitte gib einen Namen ein"); return; }
    setLoading(true);
    try {
      await createHome(name);
      setName("");
      setError(null);
    } catch {
      setError("Home erstellen fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-page">
      <form>
        <div className="input-wrapper">
          <label htmlFor="homes">Select your Home</label>
          <select
            id="homes"
            value={activeHome?.id ?? ""}
            onChange={(e) => {
              const home = homes.find((h) => h.id === Number(e.target.value));
              if (home) setActiveHome(home);
            }}
          >
            {homes.map((home) => (
              <option key={home.id} value={home.id}>
                {home.name}
              </option>
            ))}
          </select>
        </div>
        <div className="input-wrapper">
          <label>Neues Home erstellen</label>
          <input
            type="text"
            placeholder="Name des Homes"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
          <TextButton text="Erstellen" onClicked={handleCreate} disabled={loading} />
        </div>
      </form>
    </div>
  );
}

export default Home;