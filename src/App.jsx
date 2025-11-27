import './App.css'

import CampusMap from "./components/CampusMap";

function App() {
  return (
    <div className="min-h-screen text-white">
      
      <header className="z-10 flex gap-3 items-center bg-slate-950/80 px-4 py-3 backdrop-blur">
        <h1 className="text-base font-semibold md:text-lg">
          WSU Campus GPS
        </h1>
        <h1 className="text-xs font-semibold md:text-lg">
          |
        </h1>
        <h1 className="text-xs font-semibold md:text-md">
          In progress...
        </h1>
      </header>

      <main className="relative h-[calc(100vh-3rem)]">
        <CampusMap />
      </main>
    </div>
  );
}

export default App
