function MapControls({ onZoomIn, onZoomOut, zoom }) {
  const handleMouseDown = (e) => {
    // Prevent starting a pan when clicking on the controls
    e.stopPropagation();
  };

  return (
    <div
      className="absolute right-4 top-4 flex flex-col w-fit space-y-2 text-xs text-slate-300"
      onMouseDown={handleMouseDown}
    >
      <button
        className="px-3 py-2 rounded-lg text-center bg-slate-800/80 hover:bg-slate-800 shadow-lg"
        onClick={() => onZoomIn && onZoomIn()}
      >
        +
      </button>
      <button
        className="px-3 py-2 rounded-lg text-center bg-slate-800/80 hover:bg-slate-800 shadow-lg"
        onClick={() => onZoomOut && onZoomOut()}
      >
        -
      </button>

      {/* Optional: show current zoom for debugging */}
      <div className="px-2 py-1 rounded-lg bg-slate-900/70 text-center">
        {zoom.toFixed(2)}x
      </div>
    </div>
  );
}

export default MapControls;
