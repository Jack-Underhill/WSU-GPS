import { useState } from 'react';

export default function EdgeLine({ edge, vertices }) {
  const [hovered, setHovered] = useState(false);

  const u = vertices[edge.u];
  const v = vertices[edge.v];

  // Safety: skip if graph is miswired
  if (!u || !v) return null;

  const { x: x1, y: y1 } = u.position;
  const { x: x2, y: y2 } = v.position;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={hovered ? '#facc15' : 'rgba(59,130,246,0.8)'} // yellow-400 vs blue-500
      strokeWidth={hovered ? 4 : 2}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
}
