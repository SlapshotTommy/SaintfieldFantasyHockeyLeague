import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

// Position caps for formations
const formations = {
  "3-4-3": { DEF: 3, MID: 4, FWD: 3, GK: 1 },
  "4-4-2": { DEF: 4, MID: 4, FWD: 2, GK: 1 },
};

function TeamBuilder() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [formation, setFormation] = useState("3-4-3");
  const [selected, setSelected] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    getDocs(collection(db, "players")).then((snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "teams"), where("userId", "==", user.uid));
    getDocs(q).then((snap) => {
      if (!snap.empty) {
        const t = snap.docs[0].data();
        setTeamName(t.teamName);
        setFormation(t.formation);
        setSelected(t.players);
      }
    });
  }, [user]);

  const counts = selected.reduce(
    (acc, p) => {
      acc[p.position] = (acc[p.position] || 0) + 1;
      return acc;
    },
    { DEF: 0, MID: 0, FWD: 0, GK: 0 }
  );

  const formCaps = formations[formation];

  const validSelection =
    selected.length === 11 &&
    counts.DEF === formCaps.DEF &&
    counts.MID === formCaps.MID &&
    counts.FWD === formCaps.FWD &&
    counts.GK === 1;

  const togglePlayer = (player) => {
    const present = selected.find((p) => p.id === player.id);
    if (present) {
      setSelected(selected.filter((p) => p.id !== player.id));
    } else {
      setSelected([...selected, player]);
    }
  };

  const handleSave = async () => {
    if (!validSelection) {
      return alert("Team doesn't meet formation requirements.");
    }
    const teamEntry = {
      userId: user.uid,
      teamName,
      formation,
      players: selected,
      updatedAt: new Date(),
    };
    await setDoc(doc(db, "teams", user.uid), teamEntry);
    alert("Team saved!");
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || loading) return <p>Loading…</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Create / Edit Your Fantasy Team</h2>

      <label>Team Name:</label>
      <input
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />
      <br />

      <label>Formation:</label>
      <select
        value={formation}
        onChange={(e) => {
          setFormation(e.target.value);
          setSelected([]); // reset on formation change
        }}
      >
        {Object.keys(formations).map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <h3>Team Summary ({selected.length}/11)</h3>
      <ul>
        {["GK", "DEF", "MID", "FWD"].map((pos) => (
          <li key={pos}>
            {pos}: {counts[pos] || 0} / {formCaps[pos]}{" "}
            {counts[pos] < formCaps[pos] && (
              <span style={{ color: "red" }}>
                ({formCaps[pos] - counts[pos]} more needed)
              </span>
            )}
          </li>
        ))}
      </ul>

      <hr />
      <label>Search Players:</label>
      <input
        type="text"
        placeholder="Type name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      {["GK", "DEF", "MID", "FWD"].map((pos) => (
        <div key={pos}>
          <h4>{pos}</h4>
          {filteredPlayers
            .filter((p) => p.position === pos)
            .map((player) => (
              <label key={player.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={!!selected.find((p) => p.id === player.id)}
                  disabled={
                    !selected.find((p) => p.id === player.id) &&
                    counts[pos] >= formCaps[pos]
                  }
                  onChange={() => togglePlayer(player)}
                />
                {player.name} - Last Season: {player.lastSeasonGoals || 0}{" "}
                goals, Last Week: {player.lastWeekGoals || 0} goals
              </label>
            ))}
        </div>
      ))}

      <button
        disabled={!validSelection || !teamName.trim()}
        onClick={handleSave}
        style={{ marginTop: "1rem" }}
      >
        {validSelection ? "Save Team" : "Select valid 11 players"}
      </button>

      {validSelection && (
        <div
          style={{
            marginTop: "2rem",
            border: "1px solid #ccc",
            padding: "1rem",
          }}
        >
          <h3>Summary Card</h3>
          <p>
            <strong>Team Name:</strong> {teamName}
          </p>
          <p>
            <strong>Formation:</strong> {formation}
          </p>
          {["GK", "DEF", "MID", "FWD"].map((pos) => (
            <div key={pos}>
              <strong>{pos}:</strong>{" "}
              {selected
                .filter((p) => p.position === pos)
                .map((p) => p.name)
                .join(", ") || "None"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamBuilder;
