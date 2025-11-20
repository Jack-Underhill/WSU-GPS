import EdgeLine from './EdgeLine.jsx';
import { MAP_WIDTH, MAP_HEIGHT } from '../helper/campusGraph.js';

export default function EdgeLayer({ graph }) {
  const { vertices, edges } = graph;

  return (
    <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {Object.values(edges).map((e) => (
        <EdgeLine key={e.id} edge={e} vertices={vertices} />
      ))}
    </svg>
  );
}
