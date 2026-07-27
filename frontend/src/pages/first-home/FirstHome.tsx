import { useState } from "react";
import { useHome } from "../../home/HomeContext";
import TextButton from "../../components/text-button/TextButton";
import "../login/Login.css";

function FirstHome() {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createHome } = useHome();

  async function handleCreate() {
    if (name.trim() === "") { setError("Bitte gib einen Namen ein"); return; }
    setLoading(true);
    try {
      await createHome(name);
    } catch {
      setError("Home erstellen fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <h1>{mode === "create" ? "Home erstellen" : "Home beitreten"}</h1>
      <div className="login-form">
        {mode === "create" ? (
          <input
            type="text"
            placeholder="Name des Homes (z.B. WG Konstanz)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <input
            type="text"
            placeholder="Einladungscode"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
        )}
        {error && <p className="error">{error}</p>}
        <TextButton
          text={mode === "create" ? "Erstellen" : "Beitreten"}
          onClicked={mode === "create" ? handleCreate : () => setError("Beitreten kommt bald")}
          disabled={loading}
        />
        <button
          className="link-button"
          onClick={() => { setMode(mode === "create" ? "join" : "create"); setError(null); }}
        >
          {mode === "create" ? "Einladungscode? Beitreten" : "Neues Home erstellen"}
        </button>
      </div>
    </div>
  );
}

export default FirstHome;
