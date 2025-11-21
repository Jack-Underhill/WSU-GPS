import EdgeLine from './EdgeLine.jsx';

export default function EdgeLayer({ graph, viewportSize, camera }) {
  const { vertices, edges } = graph;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {Object.values(edges).map((e) => (
        <EdgeLine
          key={e.id}
          edge={e}
          vertices={vertices}
          viewportSize={viewportSize}
          camera={camera}
        />
      ))}
    </svg>
  );
}
