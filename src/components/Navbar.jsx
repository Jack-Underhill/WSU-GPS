import NavbarLink from "./NavbarLink";
import RouteSearchInput from "./RouteSearchInput";

import portfolioIcon from "../assets/portfolio.svg";
import aboutIcon from "../assets/about.svg";

const links = [
  { label: "Portfolio", href: "https://jack-underhill.netlify.app/", icon: portfolioIcon },
  { label: "About this project", href: "https://github.com/Jack-Underhill/WSU-GPS#readme", icon: aboutIcon },
];

function Navbar({
  startName,
  endName,
  distance,
  onStartNameChange,
  onEndNameChange,
  onStartNameCommit,
  onEndNameCommit,
  startSuggestions,
  endSuggestions,
  onStartSuggestionSelect,
  onEndSuggestionSelect,
}) {
  return (
    <header className="relative z-40 flex h-12 items-center justify-between bg-slate-950/80 px-10 backdrop-blur">
      {/* Left side: title/status */}
      <div className="flex items-baseline gap-2">
        <h1 className="text-base font-semibold md:text-lg">Campus GPS</h1>
        <span className="hidden text-xs font-semibold text-slate-400 sm:inline md:text-sm">
          In progress...
        </span>
      </div>

      {/* Middle: route summary + inputs */}
      <div className="flex items-center px-3 gap-3 text-xs md:text-sm">
        <RouteSearchInput
          label="From"
          value={startName}
          placeholder="Select start"
          onChange={onStartNameChange}
          onCommit={onStartNameCommit}
          suggestions={startSuggestions}
          onSuggestionSelect={onStartSuggestionSelect}
        />

        <RouteSearchInput
          label="To"
          value={endName}
          placeholder="Select end"
          onChange={onEndNameChange}
          onCommit={onEndNameCommit}
          suggestions={endSuggestions}
          onSuggestionSelect={onEndSuggestionSelect}
        />

        {/* Distance (read-only) */}
        {distance != null && (
          <div className="flex items-center gap-1">
            <span className="uppercase tracking-wide text-slate-400">
              Distance
            </span>
            <span className="w-10 rounded border border-slate-700 bg-slate-900/80 py-0.5 font-mono text-[11px] text-slate-100 md:text-xs">
              {distance}
            </span>
          </div>
        )}
      </div>

      {/* Right side: icon links */}
      <nav className="flex items-center gap-3" aria-label="Project links">
        {links.map((link) => (
          <NavbarLink key={link.label} {...link} />
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
