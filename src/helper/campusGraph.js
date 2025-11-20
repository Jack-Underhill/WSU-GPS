import { createGraph } from './graph.js';

export function createCampusGraph() {
  const g = createGraph();

  // Vertices
  g.addVertex({ id: 'SPARK',   name: 'SPARK',   x: 320, y: 180, isTerminal: true });
  g.addVertex({ id: 'WILSON',   name: 'WILSON',   x: 180, y: 320, isTerminal: true });

  // Edges
  g.addEdge({ id: 'SPARK-WILSON',   u: 'SPARK',   v: 'WILSON',  weight: 60 });

  return g;
}
