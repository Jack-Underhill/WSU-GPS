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

  return (
    <div className="min-h-screen text-white">
      <Navbar
        startName={routeSummary.startName}
        endName={routeSummary.endName}
        distance={routeSummary.distance}
        onStartNameChange={handleStartNameChange}
        onEndNameChange={handleEndNameChange}
      />

      <main className="relative h-[calc(100vh-3rem)]">
        <CampusMap onRouteSelectionChange={handleRouteSelectionChange} />
      </main>
    </div>
  );
}

export default App;
