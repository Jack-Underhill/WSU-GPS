import EdgeLine from './EdgeLine.jsx';

export default function EdgeLayer({
  graph,
  viewportSize,
  camera,
  highlightedEdgeIds = [],
  hoveredEdgeId = null,
  onEdgeHoverChange,
  pathEdgeIds = [],
}) {
  const { vertices, edges } = graph;
  const highlightedSet = new Set(highlightedEdgeIds);
  const pathSet = new Set(pathEdgeIds);

  return (
    <svg className="absolute inset-0 w-full h-full">
      {Object.values(edges).map((e) => {
        const isHovered = hoveredEdgeId === e.id;
        const isOnPath = pathSet.has(e.id);
        const isHighlighted = highlightedSet.has(e.id) || isHovered;

        return (
          <EdgeLine
            key={e.id}
            edge={e}
            vertices={vertices}
            viewportSize={viewportSize}
            camera={camera}
            isHighlighted={isHighlighted}
            isHovered={isHovered}
            isOnPath={isOnPath}
            onHoverChange={(isHovering) =>
              onEdgeHoverChange && onEdgeHoverChange(e.id, isHovering)
            }
          />
        );
      })}
    </svg>
  );
}
