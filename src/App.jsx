import { useState } from 'react'
import './App.css'

import CampusMap from "./components/CampusMap";

function App() {
  return (
    <div className="min-h-screen text-white">
      {/* Top bar (optional, but nice for context) */}
      <header className="z-10 flex bg-slate-950/80 px-4 py-3 backdrop-blur">
        <h1 className="text-base font-semibold md:text-lg">
          WSU GPS
        </h1>
      </header>

      {/* Main map + UI area */}
      <main className="relative h-[calc(100vh-3rem)]">
        {/* Map as background layer */}
        <CampusMap />

        {/* Overlay UI layer */}
        <div className="pointer-events-none absolute inset-0 flex">
          {/* Left: controls UI */}
          <div className="pointer-events-auto m-4 space-y-4">
            <section className="max-w-xs rounded-2xl bg-slate-950/75 p-4 shadow-lg">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                Map Controls
              </h2>
              <div className="space-y-2 text-xs text-slate-300">
                {/* TODO: replace with real controls later */}
                <button className="w-full rounded-lg bg-slate-800 px-3 py-2 text-left hover:bg-slate-700">
                  Zoom / Layer controls
                </button>
              </div>
            </section>
          </div>

          {/* Right: GPS / info UI */}
          <div className="pointer-events-auto ml-auto m-4 flex w-full max-w-sm flex-col gap-4">
            <section className="rounded-2xl bg-slate-950/75 p-4 shadow-lg">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                GPS / Directions
              </h2>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App
