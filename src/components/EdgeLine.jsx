import { worldToScreen } from '../helper/coordinates.js';

export default function EdgeLine({
  edge,
  vertices,
  viewportSize,
  camera,
  isHighlighted = false,
  isHovered = false,
  onHoverChange,
}) {
  const u = vertices[edge.u];
  const v = vertices[edge.v];
  if (!u || !v) return null;

  const { x: x1, y: y1 } = worldToScreen(u.position, viewportSize, camera);
  const { x: x2, y: y2 } = worldToScreen(v.position, viewportSize, camera);

  const active = isHighlighted || isHovered;

  const stroke = active
    ? 'rgba(59,130,246,0.8)' // brighter when active
    : 'rgba(59,130,246,0.4)';
  const strokeWidth = active ? 4 : 2;

  // Midpoint for the weight label
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Slight offset so the label sits just above the line
  const labelOffsetY = -4;

  // Edge weight text
  const labelText = String(edge.weight);
  const paddingX = 12; // "px-3" ish
  const labelH = 12;  // roughly the height of the badge
  const charWidth = 6; // approx per-char width at fontSize=10
  const labelW = paddingX * 2 + labelText.length * charWidth;
  const rectX = midX - labelW / 2;
  const rectY = midY + labelOffsetY - labelH / 2;

  // Wider, invisible hitbox for easier hovering
  const hitStrokeWidth = 12; // adjust if you want more/less padding

  return (
    <>
      {/* Invisible hitbox line: big stroke, handles hover events */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(0,0,0,0.001)" // almost transparent but still counts as visibleStroke
        strokeWidth={hitStrokeWidth}
        style={{ pointerEvents: 'stroke' }}
        onMouseEnter={() => onHoverChange && onHoverChange(true)}
        onMouseLeave={() => onHoverChange && onHoverChange(false)}
      />

      {/* Visible edge line (no pointer events) */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={{ pointerEvents: 'none' }}
      />

      {/* Hover label */}
      {isHovered && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={rectX}
            y={rectY}
            width={labelW}
            height={labelH}
            rx={labelH / 2}
            ry={labelH / 2}
            fill="rgba(15,23,42,0.85)" // slate-900/85
          />
          <text
            x={midX}
            y={midY + labelOffsetY}
            fill="rgba(241,245,249,0.95)" // slate-100-ish
            fontSize={10}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {labelText}
          </text>
        </g>
      )}
    </>
  );
}
