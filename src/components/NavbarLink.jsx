function NavbarLink({ label, href, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full
                 bg-slate-900/0 p-1 transition
                 hover:scale-105
                 hover:ring-2 hover:ring-emerald-400/70"
    >
      <img
        src={icon}
        alt={label}
        className="h-full w-full"
      />
    </a>
  );
}

export default NavbarLink;
