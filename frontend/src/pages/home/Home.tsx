import { useState } from "react";
import "./Home.css";
import { useHome } from "../../home/HomeContext";
import TextButton from "../../components/text-button/TextButton";
import Dropdown from "../../components/dropdown/Dropdown";

function Home() {
  const { homes, activeHome, setActiveHome, createHome, joinHome } = useHome();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  async function handleCreate() {
    if (name.trim() === "") {
      setError("Please enter a name");
      return;
    }
    setLoading(true);
    try {
      await createHome(name);
      setName("");
      setError(null);
    } catch {
      setError("Could not create home");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (joinCode.trim() === "") {
      setJoinError("Please enter an invite code");
      return;
    }
    setJoining(true);
    try {
      await joinHome(joinCode.trim());
      setJoinCode("");
      setJoinError(null);
    } catch (e: unknown) {
      setJoinError(e instanceof Error ? e.message : "Could not join home");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="home-page">
      <form>
        {/* <div className="input-wrapper">
          <label htmlFor="homes">Select your home</label>
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
        </div> */}
        <Dropdown
          activeHome={activeHome}
          homes={homes}
          setActiveHome={setActiveHome}
          labelText={"Select your home"}
        />
        {activeHome?.joinCode && (
          <div className="input-wrapper">
            <label>Invite code for “{activeHome.name}”</label>
            <p className="join-code">{activeHome.joinCode}</p>
            <span className="hint">
              Share this code to invite someone to this home.
            </span>
          </div>
        )}

        <div className="input-wrapper">
          <label>Create a new home</label>
          <input
            type="text"
            placeholder="Home name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
          <TextButton
            text="Create"
            onClicked={handleCreate}
            disabled={loading}
          />
        </div>

        <div className="input-wrapper">
          <label htmlFor="joinCode">Join a home</label>
          <input
            id="joinCode"
            type="text"
            placeholder="Invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          {joinError && <p className="form-error">{joinError}</p>}
          <TextButton text="Join" onClicked={handleJoin} disabled={joining} />
        </div>
      </form>
    </div>
  );
}

export default Home;
