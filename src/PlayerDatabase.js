import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function PlayerDatabase() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [clubFilter, setClubFilter] = useState("");
  const [valueFilter, setValueFilter] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const fetchPlayers = async () => {
      const snapshot = await getDocs(collection(db, "players"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
    };
    fetchPlayers();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setPositionFilter("");
    setClubFilter("");
    setValueFilter("");
  };

  let filteredPlayers = players.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (positionFilter ? p.position === positionFilter : true) &&
      (clubFilter ? p.club === clubFilter : true) &&
      (valueFilter ? Number(p.value) === Number(valueFilter) : true)
    );
  });

  if (sortBy) {
    filteredPlayers.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Player Database</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name"
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-40"
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
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-40"
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
        >
          <option value="">All Clubs</option>
          <option value="Ladies">Ladies</option>
          <option value="Mens">Mens</option>
        </select>

        <select
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-40"
          value={valueFilter}
          onChange={(e) => setValueFilter(e.target.value)}
        >
          <option value="">All Values</option>
          {[...Array(20)].map((_, i) => (
            <option key={i} value={(i + 2) / 2}>
              {(i + 2) / 2}
            </option>
          ))}
        </select>

        <button
          onClick={handleResetFilters}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {[
                "name",
                "gender",
                "position",
                "club",
                "value",
                "matchesStarted",
                "goalsScored",
                "cleanSheets",
                "pomAwards",
                "weekPoints",
                "totalPoints",
              ].map((field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-4 py-2 text-left text-sm font-semibold border-b border-gray-300 cursor-pointer hover:bg-gray-200"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                  {sortBy === field && (
                    <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-gray-50 border-b border-gray-200"
              >
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.gender}</td>
                <td className="px-4 py-2">{p.position}</td>
                <td className="px-4 py-2">{p.club}</td>
                <td className="px-4 py-2">{p.value}</td>
                <td className="px-4 py-2">{p.matchesStarted}</td>
                <td className="px-4 py-2">{p.goalsScored}</td>
                <td className="px-4 py-2">{p.cleanSheets}</td>
                <td className="px-4 py-2">{p.pomAwards}</td>
                <td className="px-4 py-2">{p.weekPoints}</td>
                <td className="px-4 py-2">{p.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlayerDatabase;
