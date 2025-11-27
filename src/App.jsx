import "./App.css";
import { useState, useCallback } from "react";
import CampusMap from "./components/CampusMap";
import Navbar from "./components/Navbar";

function App() {
  const [routeSummary, setRouteSummary] = useState({
    startName: "",
    endName: "",
    distance: null,
  });

  // queries coming from navbar when user hits Enter
  const [startSearchQuery, setStartSearchQuery] = useState(null);
  const [endSearchQuery, setEndSearchQuery] = useState(null);

  // Called by CampusMap when start/end or distance changes
  const handleRouteSelectionChange = useCallback(
    ({ startVertex, endVertex, distance }) => {
      setRouteSummary({
        startName: startVertex ? startVertex.name : "",
        endName: endVertex ? endVertex.name : "",
        distance: distance ?? null,
      });
    },
    []
  );

  // Called when user types in the navbar inputs
  const handleStartNameChange = (value) => {
    setRouteSummary((prev) => ({
      ...prev,
      startName: value,
    }));
  };

  const handleEndNameChange = (value) => {
    setRouteSummary((prev) => ({
      ...prev,
      endName: value,
    }));
  };

  // called when user presses Enter in the start input
  const handleStartNameCommit = () => {
    const q = routeSummary.startName.trim();
    setStartSearchQuery(q || null);
  };

  // called when user presses Enter in the end input
  const handleEndNameCommit = () => {
    const q = routeSummary.endName.trim();
    setEndSearchQuery(q || null);
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar
        startName={routeSummary.startName}
        endName={routeSummary.endName}
        distance={routeSummary.distance}
        onStartNameChange={handleStartNameChange}
        onEndNameChange={handleEndNameChange}
        onStartNameCommit={handleStartNameCommit}
        onEndNameCommit={handleEndNameCommit}
      />

      <main className="relative h-[calc(100vh-3rem)]">
  <CampusMap
    onRouteSelectionChange={handleRouteSelectionChange}
    startSearchQuery={startSearchQuery}   // on Enter (commit)
    endSearchQuery={endSearchQuery}       // on Enter (commit)
    startInputValue={routeSummary.startName}  // live typing
    endInputValue={routeSummary.endName}      // live typing
  />
      </main>
    </div>
  );
}

export default App;
