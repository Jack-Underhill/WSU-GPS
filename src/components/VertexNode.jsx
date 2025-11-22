import { useState } from 'react';

export default function VertexNode({
  vertex,
  screenPosition,
  onClick,
  isSelected,
  onHoverChange,
  degree,
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

  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Wrapper so we can position badge relative to the dot */}
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* The actual vertex dot */}
        <div
          className={`
            w-4 h-4 z-10 rounded-full
            ${isSelected ? 'bg-blue-500 ring-2 ring-blue-400 scale-125' : 'bg-blue-500/50'}
            cursor-pointer
            transition
            hover:bg-blue-500
            hover:scale-125
            hover:ring-2
            hover:ring-blue-400
          `}
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

        {/* Optional ID label on hover, if you want both at once */}
        {/* {hovered && (
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
        )} */}
      </div>
    </div>
  );
}
