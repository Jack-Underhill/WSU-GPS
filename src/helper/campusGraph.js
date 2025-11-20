import { createGraph } from '../models/graph.js';

export const MAP_WIDTH = 1024;
export const MAP_HEIGHT = 512;

export function createCampusGraph() {
  const g = createGraph();

  // Vertices
  g.addVertex({ id: 'SPARK',   name: 'SPARK',   x: 320, y: 180, isTerminal: true });
  g.addVertex({ id: 'WILSON',   name: 'WILSON',   x: 180, y: 120, isTerminal: true });
  g.addVertex({ id: '2',   name: 'WILSON',   x: 0, y: 0, isTerminal: true });

  // Edges
  g.addEdge({ id: 'SPARK-WILSON',   u: 'SPARK',   v: 'WILSON',  weight: 60 });

  return g;
}
