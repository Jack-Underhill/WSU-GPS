import { createGraph } from '../models/graph.js';

export const MAP_WIDTH = 1024;
export const MAP_HEIGHT = 512;

export function createCampusGraph() {
  const g = createGraph();

  // Vertices
  g.addVertex({ id: 'SPARK',   name: 'SPARK',   x: 420, y: 120, isTerminal: true });
  g.addVertex({ id: 'WILSON',   name: 'WILSON',   x: 220, y: 420, isTerminal: true });
  g.addVertex({ id: '2',   name: 'WILSON',   x: 0, y: 0, isTerminal: true });
  g.addVertex({ id: '3',   name: 'WILSON',   x: 1011, y: 499, isTerminal: true });

  // Edges
  g.addEdge({ id: '2-3',   u: '2',   v: '3',  weight: 60 });
  g.addEdge({ id: 'SPARK-3',   u: 'SPARK',   v: '3',  weight: 60 });
  g.addEdge({ id: 'WILSON-2',   u: 'WILSON',   v: '2',  weight: 60 });
  g.addEdge({ id: 'WILSON-SPARK',   u: 'WILSON',   v: 'SPARK',  weight: 60 });

  return g;
}
