import NavbarLink from "./NavbarLink";

import portfolioIcon from "../assets/portfolio.svg";
import aboutIcon     from "../assets/about.svg";

const links = [
  {
    label: "Portfolio",
    href: "https://jack-underhill.netlify.app/",
    icon: portfolioIcon,
  },
  {
    label: "About this project",
    href: "https://github.com/Jack-Underhill/WSU-GPS#readme",
    icon: aboutIcon,
  },
];

function Navbar() {
  return (
    <header className="z-10 flex h-12 items-center justify-between
                       bg-slate-950/80 px-10 backdrop-blur">
      {/* Left side: title/status */}
      <div className="flex items-baseline gap-2">
        <h1 className="text-base font-semibold md:text-lg">
          Campus GPS
        </h1>
        <span className="hidden text-xs font-semibold text-slate-400 sm:inline md:text-sm">
          In progress...
        </span>
      </div>

      {/* Right side: icon links */}
      <nav
        className="flex items-center gap-3"
        aria-label="Project links"
      >
        {links.map(link => (
          <NavbarLink key={link.label} {...link} />
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
