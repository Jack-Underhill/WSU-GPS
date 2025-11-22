import { useState } from 'react';

export default function VertexNode({ vertex, screenPosition, onClick, isSelected }) {
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

  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* The actual vertex dot */}
      <div
        className={`
          relative
          -translate-x-1/2 -translate-y-1/2
          w-4 h-4 z-10 rounded-full
          ${isSelected ? 'bg-yellow-400 ring-2 ring-yellow-300 scale-125' : 'bg-blue-500/50'}
          cursor-pointer
          transition
          hover:bg-yellow-400
          hover:scale-125
          hover:ring-2
          hover:ring-yellow-300
        `}
        title={`${id} (${name})`}
      />

      {/* Hover label with unique ID */}
      {hovered && (
        <div
          className="
            absolute z-30
            left-1/2 -top-5
            -translate-x-1/2
            px-1.5 py-0.5
            rounded
            bg-slate-900/90
            text-[10px]
            text-slate-100
            whitespace-nowrap
            pointer-events-none
            shadow
          "
        >
          {id}
        </div>
      )}
    </div>
  );
}
