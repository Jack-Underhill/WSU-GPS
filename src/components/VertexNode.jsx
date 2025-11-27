import { useState } from 'react';

export default function VertexNode({
  vertex,
  screenPosition,
  onClick,
  isSelected,
  onHoverChange,
  degree,
  isOnPath = false,
  isRouteStart = false,
  isRouteEnd = false,
  isTraversalActive = false,
}) {
  const { id, name } = vertex;
  const { x, y } = screenPosition;
  const [hovered, setHovered] = useState(false);

  const handleMouseDown = (e) => {
    // If using this node for editing (clicks), don't let mousedown
    // bubble and start a pan.
    if (onClick) {
      e.stopPropagation();
    }
  };

  const handleClick = (e) => {
    if (!onClick) return;
    e.stopPropagation();
    onClick(vertex);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (onHoverChange) onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (onHoverChange) onHoverChange(false);
  };

  let dotClassesBase =
    'w-4 h-4 z-10 rounded-full cursor-pointer transition ' +
    'hover:scale-125 hover:ring-2';

  let colorClasses;
  if (isSelected) {
    // Dev edit selection
    colorClasses =
      'bg-blue-500 ring-2 ring-blue-400 scale-125 ' +
      'hover:bg-blue-500 hover:ring-blue-400';
  } else if (isRouteStart) {
    // Start of route
    colorClasses =
      'bg-emerald-400 ring-2 ring-emerald-300 ' +
      'hover:bg-emerald-500 hover:ring-emerald-400';
  } else if (isRouteEnd) {
    // End of route
    colorClasses =
      'bg-rose-400 ring-2 ring-rose-300 ' +
      'hover:bg-rose-500 hover:ring-rose-400';
  } else if (isTraversalActive) {
    // Currently active vertex in Dijkstra traversal
    colorClasses =
      'bg-violet-400 ring-2 ring-violet-300 ' +
      'hover:bg-violet-500 hover:ring-violet-400';
  } else if (isOnPath) {
    // Vertex along shortest path
    colorClasses =
      'bg-amber-400 ring-2 ring-amber-300 ' +
      'hover:bg-amber-500 hover:ring-amber-400';
  } else {
    // Normal vertex
    colorClasses =
      'bg-blue-500/50 ' +
      'hover:bg-blue-500 hover:ring-blue-400';
  }

  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Wrapper to position badge relative to the dot */}
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* The actual vertex dot */}
        <div
          className={`${dotClassesBase} ${colorClasses}`}
          title={`${id} (${name})`}
        />

        {/* Degree badge (small, subtle) */}
        {typeof degree === 'number' && (
          <div
            className="
              absolute
              -bottom-2 -right-2
              px-1
              rounded-full
              bg-slate-900/85
              text-[10px]
              leading-none
              text-slate-100
              pointer-events-none
              shadow
            "
          >
            {degree}
          </div>
        )}
      </div>
    </div>
  );
}
