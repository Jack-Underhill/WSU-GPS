import { useRef } from "react";
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
  // Ref to the "To" input to auto-focus it from the "From" field
  const toInputRef = useRef(null);

  const handleFromCommit = () => {
    onStartNameCommit?.();
    if (toInputRef.current) {
      toInputRef.current.focus();
    }
  };

  const handleFromSuggestionSelect = (vertex) => {
    onStartSuggestionSelect?.(vertex);
    if (toInputRef.current) {
      toInputRef.current.focus();
    }
  };

  return (
    <header 
      className="
        relative z-40 
        flex flex-wrap items-center 
        gap-x-6 gap-y-2
        px-4 md:px-10 py-3
        justify-between
        bg-slate-950/85 backdrop-blur
      "
    >
      {/* Left side: title/status */}
      <div className="flex order-1 items-baseline gap-2 flex-none">
        <h1 className="text-lg font-semibold md:text-xl text-slate-50">Campus GPS</h1>
      </div>

      {/* Middle: route summary + inputs */}
      <div 
        className="
          flex flex-wrap items-center gap-3
          text-xs md:text-sm
          order-3 md:order-2
          basis-full md:basis-auto
          md:flex-1 justify-center
        "
      >
        <RouteSearchInput
          label="From"
          value={startName}
          placeholder="Select start"
          onChange={onStartNameChange}
          onCommit={handleFromCommit}
          suggestions={startSuggestions}
          onSuggestionSelect={handleFromSuggestionSelect}
        />

        <RouteSearchInput
          label="To"
          value={endName}
          placeholder="Select end"
          onChange={onEndNameChange}
          onCommit={onEndNameCommit}
          suggestions={endSuggestions}
          onSuggestionSelect={onEndSuggestionSelect}
          inputRef={toInputRef}
        />

        {/* Distance (read-only) */}
        {distance != null && (
          <div className="flex items-center gap-1.5">
            <span className="uppercase tracking-wide text-[#DEE8D0]">
              Distance
            </span>
            <span className="w-fit py-0.5 font-mono text-xs text-slate-50 md:text-xs">
              {distance}
            </span>
          </div>
        )}
      </div>

      {/* Right side: icon links */}
      <nav className="flex order-2 md:order-3 items-center gap-3 flex-none" aria-label="Project links">
        {links.map((link) => (
          <NavbarLink key={link.label} {...link} />
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
