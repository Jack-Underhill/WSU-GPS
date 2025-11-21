import { useState } from 'react';
import { worldToScreen } from '../helper/coordinates.js';

export default function EdgeLine({ edge, vertices, viewportSize, camera }) {
  const [hovered, setHovered] = useState(false);

  const u = vertices[edge.u];
  const v = vertices[edge.v];
  if (!u || !v) return null;

  const { x: x1, y: y1 } = worldToScreen(u.position, viewportSize, camera);
  const { x: x2, y: y2 } = worldToScreen(v.position, viewportSize, camera);

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
