import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import * as XLSX from "xlsx";

function AdminPanel() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [date, setDate] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      const playerNames = worksheet.slice(1).map((row) => row[0]);
      const gameHeaders = worksheet[0].slice(7); // columns H onward
      const gameData = gameHeaders.map((header, index) => {
        const participants = worksheet.slice(1).map((row) => ({
          name: row[0],
          played: row[7 + index] === 1,
          goals: 0,
          cleanSheet: false,
          playerOfMatch: false,
        }));
        return {
          header,
          participants,
        };
      });

      setGames(gameData);
    };

    reader.readAsBinaryString(file);
  };

  const handlePlayerChange = (index, field, value) => {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
  };

  const handleSubmit = async () => {
    const filteredPlayers = players.filter((p) => p.played);

    await addDoc(collection(db, "matches"), {
      date,
      homeTeam,
      awayTeam,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      players: filteredPlayers,
    });

    alert("Match submitted!");
    setSelectedGame(null);
    setPlayers([]);
    setHomeTeam("");
    setAwayTeam("");
    setHomeScore("");
    setAwayScore("");
    setDate("");
  };

  return (
    <div>
      <h2>Admin Panel - Import Match from XLSX</h2>
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      <hr />

      {!selectedGame &&
        games.map((game, index) => (
          <div key={index}>
            <p>
              <strong>{game.header}</strong>
            </p>
            <button
              onClick={() => {
                setSelectedGame(game);
                setPlayers(game.participants);
              }}
            >
              Edit Game
            </button>
            <hr />
          </div>
        ))}

      {selectedGame && (
        <div>
          <h3>Editing: {selectedGame.header}</h3>

          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <br />

          <label>Home Team:</label>
          <input
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
          />
          <br />

          <label>Away Team:</label>
          <input
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
          />
          <br />

          <label>Score:</label>
          <input
            type="number"
            value={homeScore}
            placeholder="Home"
            onChange={(e) => setHomeScore(e.target.value)}
            style={{ width: "60px" }}
          />
          {" - "}
          <input
            type="number"
            value={awayScore}
            placeholder="Away"
            onChange={(e) => setAwayScore(e.target.value)}
            style={{ width: "60px" }}
          />
          <br />
          <br />

          <h4>Player Stats</h4>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Name</th>
                <th>Played</th>
                <th>Goals</th>
                <th>Clean Sheet</th>
                <th>Player of Match</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={idx}>
                  <td>{player.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={player.played}
                      onChange={(e) =>
                        handlePlayerChange(idx, "played", e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={player.goals}
                      min={0}
                      onChange={(e) =>
                        handlePlayerChange(
                          idx,
                          "goals",
                          parseInt(e.target.value || 0)
                        )
                      }
                      style={{ width: "50px" }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={player.cleanSheet}
                      onChange={(e) =>
                        handlePlayerChange(idx, "cleanSheet", e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={player.playerOfMatch}
                      onChange={(e) =>
                        handlePlayerChange(
                          idx,
                          "playerOfMatch",
                          e.target.checked
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <br />
          <button onClick={handleSubmit}>Submit Match</button>
          <button onClick={() => setSelectedGame(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
