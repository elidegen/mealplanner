import { useState } from "react";
import TextButton from "../../components/text-button/TextButton";
import "./Home.css";

const DUMMY_HOMES = ["Home 1", "Home 2", "Home 3"];

function Home() {
  const [selectedHome, setSelectedHome] = useState<string>(DUMMY_HOMES[0]);
  const [newHome, setNewHome] = useState<string>("");

  function handleLogin() {
    console.log("Logging into:", selectedHome);
  }

  return (
    <div className="home-page">
      <form>
        <div className="input-wrapper">
          <label htmlFor="homes">Select your Home</label>
          <select
            id="homes"
            value={selectedHome}
            onChange={(e) => setSelectedHome(e.target.value)}
          >
            {DUMMY_HOMES.map((home) => (
              <option key={home} value={home}>
                {home}
              </option>
            ))}
          </select>
        </div>
        <div className="input-wrapper">
          <label htmlFor="newHome">Add new home</label>
          <input
            id="newHome"
            type="text"
            placeholder="Enter passcode"
            value={newHome}
            onChange={(e) => setNewHome(e.target.value)}
          />
        </div>
        <TextButton text="Log in new Home" onClicked={handleLogin} />
      </form>
    </div>
  );
}

export default Home;
