import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function ImportPlayers() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editData, setEditData] = useState({});

  const [adminEmails, setAdminEmails] = useState([
    "thomasbrown248@gmail.com",
    "thomasbrown16@hotmail.co.uk",
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPlayers = async () => {
      const snapshot = await getDocs(collection(db, "players"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
      setLoading(false);
    };

    fetchPlayers();
  }, [uploading, user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      let importedCount = 0;

      for (let row of json) {
        const {
          Name,
          Value,
          "Matches Started": matchesStarted,
          "Goals Scored": goalsScored,
          "Goals Conceded": goalsConceded,
          "Clean Sheets": cleanSheets,
          "POM Awards": pomAwards,
          "Week Points": weekPoints,
          "Total Points": totalPoints,
          Position,
          "Assist (TP + POM Awards)": assistSummary,
          "Assisted Points": assistedPoints,
          Gender,
        } = row;

        if (!Name || !Position) continue;

        const newPlayer = {
          name: Name.trim(),
          value: Number(Value) || 0,
          matchesStarted: Number(matchesStarted) || 0,
          goalsScored: Number(goalsScored) || 0,
          goalsConceded: Number(goalsConceded) || 0,
          cleanSheets: Number(cleanSheets) || 0,
          pomAwards: Number(pomAwards) || 0,
          weekPoints: Number(weekPoints) || 0,
          totalPoints: Number(totalPoints) || 0,
          position: Position.trim() || "unknown",
          assistSummary: assistSummary || "",
          assistedPoints: Number(assistedPoints) || 0,
          gender: Gender.trim() || "unknown",
        };

        const docRef = doc(db, "players", newPlayer.name);
        await setDoc(docRef, newPlayer);
        importedCount++;
      }

      alert(`Imported ${importedCount} players.`);
      setUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSaveEdit = async () => {
    if (!editingPlayer) return;

    const docRef = doc(db, "players", editingPlayer.name);
    await setDoc(docRef, { ...editingPlayer, ...editData });
    setEditingPlayer(null);
    setUploading(true);
    setUploading(false);
  };

  if (!user) return <p>Checking access...</p>;
  if (!adminEmails.includes(user.email))
    return <p>Access denied. Admins only.</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📥 Import Players (Admin Only)</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {uploading && <p>Uploading...</p>}

      <h3>🧍 SHC Players ({players.length})</h3>
      {loading ? (
        <p>Loading players...</p>
      ) : (
        <table border="1" cellPadding="6" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Position</th>
              <th>Value</th>
              <th>Matches Started</th>
              <th>Goals Scored</th>
              <th>Clean Sheets</th>
              <th>POM Wins</th>
              <th>Week Points</th>
              <th>Total Points</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.gender}</td>
                <td>{p.position}</td>
                <td>{p.value}</td>
                <td>{p.matchesStarted}</td>
                <td>{p.goalsScored}</td>
                <td>{p.cleanSheets}</td>
                <td>{p.pomAwards}</td>
                <td>{p.weekPoints}</td>
                <td>{p.totalPoints}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditingPlayer(p);
                      setEditData(p);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {editingPlayer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>Edit Player: {editingPlayer.name}</h3>

            {[
              "value",
              "matchesStarted",
              "goalsScored",
              "goalsConceded",
              "cleanSheets",
              "pomAwards",
              "weekPoints",
              "totalPoints",
              "assistedPoints",
            ].map((field) => (
              <div key={field} style={{ marginBottom: "0.5rem" }}>
                <label>{field}: </label>
                <input
                  type="number"
                  value={editData[field] ?? 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      [field]: Number(e.target.value),
                    })
                  }
                />
              </div>
            ))}

            <button
              onClick={handleSaveEdit}
              style={{ marginRight: "1rem", marginTop: "1rem" }}
            >
              Save
            </button>
            <button onClick={() => setEditingPlayer(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportPlayers;
