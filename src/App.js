import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function PlayerDatabase() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [clubFilter, setClubFilter] = useState("");
  const [valueFilter, setValueFilter] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    matchesStarted: "",
    goalsScored: "",
    cleanSheets: "",
    pomAwards: "",
    weekPoints: "",
    totalPoints: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchPlayers = async () => {
      const snapshot = await getDocs(collection(db, "players"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
    };
    fetchPlayers();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setPositionFilter("");
    setClubFilter("");
    setValueFilter("");
    setAdvancedFilters({
      matchesStarted: "",
      goalsScored: "",
      cleanSheets: "",
      pomAwards: "",
      weekPoints: "",
      totalPoints: "",
    });
  };

  const filteredPlayers = players
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (positionFilter ? p.position === positionFilter : true))
    .filter((p) => (clubFilter ? p.gender === clubFilter : true))
    .filter((p) => (valueFilter ? p.value === Number(valueFilter) : true))
    .filter((p) =>
      Object.entries(advancedFilters).every(([key, val]) =>
        val ? p[key] === Number(val) : true
      )
    );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  };

  const filtersContainer = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1rem",
  };

  const inputStyle = {
    padding: "0.5rem",
    fontSize: "1rem",
  };

  const selectStyle = {
    padding: "0.5rem",
    fontSize: "1rem",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    cursor: "pointer",
    background: "#0077cc",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  };

  const resetButtonStyle = {
    ...buttonStyle,
    background: "#555",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  };

  const thStyle = {
    padding: "0.75rem",
    cursor: "pointer",
    background: "#f5f5f5",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "0.75rem",
    borderBottom: "1px solid #ddd",
  };

  return (
    <div style={containerStyle}>
      <h2>📊 Player Database</h2>

      <div style={filtersContainer}>
        <input
          style={inputStyle}
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={selectStyle}
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
        >
          <option value="">All Positions</option>
          <option value="GK">Goalkeeper</option>
          <option value="DEF">Defender</option>
          <option value="MID">Midfielder</option>
          <option value="FWD">Forward</option>
        </select>

        <select
          style={selectStyle}
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
        >
          <option value="">All Clubs</option>
          <option value="ladies">Ladies</option>
          <option value="mens">Mens</option>
        </select>

        <select
          style={selectStyle}
          value={valueFilter}
          onChange={(e) => setValueFilter(e.target.value)}
        >
          <option value="">All Values</option>
          {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <button
          style={buttonStyle}
          onClick={() => setShowMoreFilters(!showMoreFilters)}
        >
          {showMoreFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
        </button>

        <button style={resetButtonStyle} onClick={handleResetFilters}>
          Reset Filters
        </button>
      </div>

      {showMoreFilters && (
        <div style={{ marginBottom: "1rem" }}>
          {Object.keys(advancedFilters).map((key) => (
            <div key={key} style={{ marginBottom: "0.5rem" }}>
              <label>{key}: </label>
              <input
                type="number"
                value={advancedFilters[key]}
                style={inputStyle}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    [key]: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            {[
              "name",
              "position",
              "gender",
              "value",
              "matchesStarted",
              "goalsScored",
              "cleanSheets",
              "pomAwards",
              "weekPoints",
              "totalPoints",
            ].map((col) => (
              <th
                key={col}
                style={thStyle}
                onClick={() =>
                  setSortConfig({
                    key: col,
                    direction:
                      sortConfig.key === col && sortConfig.direction === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                {col}{" "}
                {sortConfig.key === col
                  ? sortConfig.direction === "asc"
                    ? "⬆️"
                    : "⬇️"
                  : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((p) => (
            <tr key={p.id}>
              <td style={tdStyle}>{p.name}</td>
              <td style={tdStyle}>{p.position}</td>
              <td style={tdStyle}>{p.gender}</td>
              <td style={tdStyle}>{p.value}</td>
              <td style={tdStyle}>{p.matchesStarted}</td>
              <td style={tdStyle}>{p.goalsScored}</td>
              <td style={tdStyle}>{p.cleanSheets}</td>
              <td style={tdStyle}>{p.pomAwards}</td>
              <td style={tdStyle}>{p.weekPoints}</td>
              <td style={tdStyle}>{p.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerDatabase;
