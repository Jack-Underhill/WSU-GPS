import NavbarLink from "./NavbarLink";

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
}) {
  return (
    <header className="z-10 flex h-12 items-center justify-between bg-slate-950/80 px-10 backdrop-blur">
      {/* Left side: title/status */}
      <div className="flex items-baseline gap-2">
        <h1 className="text-base font-semibold md:text-lg">Campus GPS</h1>
        <span className="hidden text-xs font-semibold text-slate-400 sm:inline md:text-sm">
          In progress...
        </span>
      </div>

      {/* Middle: route summary + inputs */}
      <div className="flex items-center px-3 gap-3 text-xs md:text-sm">
        {/* From input pill */}
        <div className="flex items-center gap-1">
          <span className="uppercase tracking-wide text-slate-400">From</span>
          <input
            type="text"
            value={startName}
            placeholder="Select start"
            onChange={(e) => onStartNameChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onStartNameCommit?.();
            }}
            className="w-25 rounded-full border border-slate-700
                       bg-slate-900/80 px-3 py-1
                       font-mono text-[11px] text-slate-100
                       outline-none ring-0
                       focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60
                       md:text-xs"
          />
        </div>

        {/* To input pill */}
        <div className="flex items-center gap-1">
          <span className="uppercase tracking-wide text-slate-400">To</span>
          <input
            type="text"
            value={endName}
            placeholder="Select end"
            onChange={(e) => onEndNameChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEndNameCommit?.();
            }}
            className="w-25 rounded-full border border-slate-700
                       bg-slate-900/80 px-3 py-1
                       font-mono text-[11px] text-slate-100
                       outline-none ring-0
                       focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60
                       md:text-xs"
          />
        </div>

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
