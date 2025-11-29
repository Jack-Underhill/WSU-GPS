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

  const [suggestionsEnabled, setSuggestionsEnabled] = useState({
    start: true,
    end: true,
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
    setSuggestionsEnabled((prev) => ({ ...prev, start: true }));  // typing re-enables
    setRouteSummary((prev) => ({
      ...prev,
      startName: value,
    }));
  };

  const handleEndNameChange = (value) => {
    setSuggestionsEnabled((prev) => ({ ...prev, end: true }));    // typing re-enables
    setRouteSummary((prev) => ({
      ...prev,
      endName: value,
    }));
  };

  // called when user presses Enter in the start input
  const handleStartNameCommit = () => {
    const q = routeSummary.startName.trim();

    // trigger commit search
    setStartSearchQuery(q || null);

    // clear current suggestions & disable until next keystroke
    setRouteSuggestions((prev) => ({
      ...prev,
      start: [],
    }));
    setSuggestionsEnabled((prev) => ({
      ...prev,
      start: false,
    }));
  };

  // called when user presses Enter in the end input
  const handleEndNameCommit = () => {
    const q = routeSummary.endName.trim();

    setEndSearchQuery(q || null);

    setRouteSuggestions((prev) => ({
      ...prev,
      end: [],
    }));
    setSuggestionsEnabled((prev) => ({
      ...prev,
      end: false,
    }));
  };

  // user clicks a suggestion in the "From" dropdown
  const handleStartSuggestionSelect = (vertex) => {
    const name = vertex.name || vertex.id;

    // fill pill text
    setRouteSummary((prev) => ({
      ...prev,
      startName: name,
    }));

    // trigger a commit search for that vertex
    setStartSearchQuery(name || null);

    // clear current suggestions & disable until next keystroke
    setRouteSuggestions((prev) => ({ ...prev, start: [] }));
    setSuggestionsEnabled((prev) => ({ ...prev, start: false }));
  };

  // user clicks a suggestion in the "To" dropdown
  const handleEndSuggestionSelect = (vertex) => {
    const name = vertex.name || vertex.id;

    setRouteSummary((prev) => ({
      ...prev,
      endName: name,
    }));

    setEndSearchQuery(name || null);

    setRouteSuggestions((prev) => ({ ...prev, end: [] }));
    setSuggestionsEnabled((prev) => ({ ...prev, end: false }));
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
        // suggestions + handlers for dropdown
        startSuggestions={routeSuggestions.start}
        endSuggestions={routeSuggestions.end}
        onStartSuggestionSelect={handleStartSuggestionSelect}
        onEndSuggestionSelect={handleEndSuggestionSelect}
      />

      <main className="relative z-0 h-[calc(100vh-3rem)]">
        <CampusMap
          onRouteSelectionChange={handleRouteSelectionChange}
          onRouteSuggestionsChange={handleRouteSuggestionsChange}
          startSearchQuery={startSearchQuery}   // on Enter (commit)
          endSearchQuery={endSearchQuery}       // on Enter (commit)
          startInputValue={routeSummary.startName}  // live typing
          endInputValue={routeSummary.endName}      // live typing
          startSuggestionsEnabled={suggestionsEnabled.start}
          endSuggestionsEnabled={suggestionsEnabled.end}
        />
      </main>
    </div>
  );
}

export default App;
