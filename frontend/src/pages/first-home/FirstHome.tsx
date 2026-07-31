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
  const { createHome, joinHome } = useHome();

  async function handleCreate() {
    if (name.trim() === "") { setError("Please enter a name"); return; }
    setLoading(true);
    try {
      await createHome(name);
    } catch {
      setError("Could not create home");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (joinCode.trim() === "") {
      setError("Please enter an invite code");
      return;
    }
    setLoading(true);
    try {
      await joinHome(joinCode.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not join home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <h1>{mode === "create" ? "Create home" : "Join home"}</h1>
      <div className="login-form">
        {mode === "create" ? (
          <input
            type="text"
            placeholder="Home name (e.g. Flat Konstanz)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <input
            type="text"
            placeholder="Invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
        )}
        {error && <p className="error">{error}</p>}
        <TextButton
          text={mode === "create" ? "Create" : "Join"}
          onClicked={mode === "create" ? handleCreate : handleJoin}
          disabled={loading}
        />
        <button
          className="link-button"
          onClick={() => { setMode(mode === "create" ? "join" : "create"); setError(null); }}
        >
          {mode === "create" ? "Have an invite code? Join" : "Create a new home"}
        </button>
      </div>
    </div>
  );
}

export default FirstHome;
