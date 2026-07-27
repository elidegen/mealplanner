import { useState } from "react";
import "./Home.css";
import { useHome } from "../../home/HomeContext";
import TextButton from "../../components/text-button/TextButton";

function Home() {
  const { homes, activeHome, setActiveHome, createHome, joinHome } = useHome();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

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

  async function handleJoin() {
    if (joinCode.trim() === "") {
      setJoinError("Bitte gib einen Einladungscode ein");
      return;
    }
    setJoining(true);
    try {
      await joinHome(joinCode.trim());
      setJoinCode("");
      setJoinError(null);
    } catch (e: unknown) {
      setJoinError(e instanceof Error ? e.message : "Beitreten fehlgeschlagen");
    } finally {
      setJoining(false);
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
        {activeHome?.joinCode && (
          <div className="input-wrapper">
            <label>Einladungscode für „{activeHome.name}“</label>
            <p className="join-code">{activeHome.joinCode}</p>
            <span className="hint">
              Teile diesen Code, um jemanden in dieses Home einzuladen.
            </span>
          </div>
        )}

        <div className="input-wrapper">
          <label>Neues Home erstellen</label>
          <input
            type="text"
            placeholder="Name des Homes"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
          <TextButton text="Erstellen" onClicked={handleCreate} disabled={loading} />
        </div>

        <div className="input-wrapper">
          <label htmlFor="joinCode">Einem Home beitreten</label>
          <input
            id="joinCode"
            type="text"
            placeholder="Einladungscode"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          {joinError && <p className="form-error">{joinError}</p>}
          <TextButton text="Beitreten" onClicked={handleJoin} disabled={joining} />
        </div>
      </form>
    </div>
  );
}

export default Home;