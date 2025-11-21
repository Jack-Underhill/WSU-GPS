import './App.css'

import CampusMap from "./components/CampusMap";

function App() {
  return (
    <div className="min-h-screen text-white">
      
      <header className="z-10 flex bg-slate-950/80 px-4 py-3 backdrop-blur">
        <h1 className="text-base font-semibold md:text-lg">
          WSU GPS
        </h1>
      </header>

      <main className="relative h-[calc(100vh-3rem)]">
        <CampusMap />
      </main>
    </div>
  );
}

export default App
