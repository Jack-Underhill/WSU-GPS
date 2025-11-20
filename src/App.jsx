import './App.css'

import CampusMap from "./components/CampusMap";
import MapControls from './components/MapControls';

function App() {
  return (
    <div className="min-h-screen text-white">
      
      {/* Top bar */}
      <header className="z-10 flex bg-slate-950/80 px-4 py-3 backdrop-blur">
        <h1 className="text-base font-semibold md:text-lg">
          WSU GPS
        </h1>
      </header>

      {/* Main map + UI area */}
      <main className="relative h-[calc(100vh-3rem)]">
        <CampusMap />
        <MapControls />
      </main>
    </div>
  );
}

export default App
