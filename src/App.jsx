import "./App.css";
import { useState, useCallback } from "react";
import CampusMap from "./components/CampusMap";
import Navbar from "./components/Navbar";

function App() {
  const [routeSummary, setRouteSummary] = useState({
    startName: null,
    endName: null,
    distance: null,
  });

  // Stable callback for CampusMap
  const handleRouteSelectionChange = useCallback(
    ({ startVertex, endVertex, distance }) => {
      setRouteSummary({
        startName: startVertex ? startVertex.name : null,
        endName: endVertex ? endVertex.name : null,
        distance: distance ?? null,
      });
    },
    []
  );

  return (
    <div className="min-h-screen text-white">
      <Navbar
        startName={routeSummary.startName}
        endName={routeSummary.endName}
        distance={routeSummary.distance}
      />

      <main className="relative h-[calc(100vh-3rem)]">
        <CampusMap onRouteSelectionChange={handleRouteSelectionChange} />
      </main>
    </div>
  );
}

export default App;
