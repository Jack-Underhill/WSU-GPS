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

  // live suggestions for both inputs
  const [routeSuggestions, setRouteSuggestions] = useState({
    start: [],
    end: [],
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

  // Called by CampusMap when live suggestions update
  const handleRouteSuggestionsChange = useCallback(
    ({ startSuggestions, endSuggestions }) => {
      setRouteSuggestions({
        start: startSuggestions,
        end: endSuggestions,
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

  // user clicks / selects a suggestion in the "From" dropdown
  const handleStartSuggestionSelect = (vertex) => {
    const name = vertex.name || vertex.id;

    setRouteSummary((prev) => ({
      ...prev,
      startName: name,
    }));

    setStartSearchQuery(name || null);
  };

  // user clicks / selects a suggestion in the "To" dropdown
  const handleEndSuggestionSelect = (vertex) => {
    const name = vertex.name || vertex.id;

    setRouteSummary((prev) => ({
      ...prev,
      endName: name,
    }));

    setEndSearchQuery(name || null);
  };

  return (
    <div className="flex flex-col w-screen h-screen text-white bg-[#DEE8D0] overflow-hidden">
      <Navbar
        startName={routeSummary.startName}
        endName={routeSummary.endName}
        distance={routeSummary.distance}
        onStartNameChange={handleStartNameChange}
        onEndNameChange={handleEndNameChange}
        onStartNameCommit={handleStartNameCommit}
        onEndNameCommit={handleEndNameCommit}
        // suggestions + handlers for dropdown
        startSuggestions={routeSuggestions.start}
        endSuggestions={routeSuggestions.end}
        onStartSuggestionSelect={handleStartSuggestionSelect}
        onEndSuggestionSelect={handleEndSuggestionSelect}
      />

      <main className="relative z-0 flex-1 min-h-0 overflow-hidden">
        <CampusMap
          onRouteSelectionChange={handleRouteSelectionChange}
          onRouteSuggestionsChange={handleRouteSuggestionsChange}
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
