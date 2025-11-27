import './App.css'

import Navbar    from './components/NavBar';
import CampusMap from "./components/CampusMap";

function App() {
  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="relative h-[calc(100vh-3rem)]">
        <CampusMap />
      </main>
    </div>
  );
}

export default App
