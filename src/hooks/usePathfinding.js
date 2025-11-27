import { useState } from 'react';
import { runDijkstra } from '../algorithms/dijkstra.js';

/**
 * Phase 2:
 * - Track start/end vertices for a route.
 * - When both are chosen, run Dijkstra and log the computed path.
 */
export function usePathfinding(graph) {
  const [startVertexId, setStartVertexId] = useState(null);
  const [endVertexId, setEndVertexId] = useState(null);

  const computeAndLogRoute = (startId, endId) => {
    if (!graph) return;

    try {
      const result = runDijkstra(graph, startId, endId);
      const { dist, pathVertices, pathEdges, visitedOrder } = result;

      if (!pathVertices.length || dist[endId] === Infinity) {
        console.log(
          `[Route] No path found from ${startId} to ${endId}.`
        );
        return;
      }

      console.log('========================================');
      console.log(`[Route] Dijkstra from ${startId} to ${endId}`);
      console.log(`[Route] Shortest distance: ${dist[endId]}`);
      console.log(
        `[Route] Path vertices: ${pathVertices.join(' -> ')}`
      );
      console.log(
        `[Route] Path edges: ${pathEdges.join(', ')}`
      );
      console.log(
        `[Route] Visited order: ${visitedOrder.join(' -> ')}`
      );
      console.log('========================================');
    } catch (err) {
      console.error('[Route] Error running Dijkstra:', err);
    }
  };

  const handleVertexClickForRoute = (vertex) => {
    if (!graph || !vertex) return;

    const id = vertex.id;

    // No start selected yet -> this becomes start
    if (startVertexId === null) {
      setStartVertexId(id);
      setEndVertexId(null);
      console.log(`[Route] Start selected: ${id}`);
      return;
    }

    // Start is set, end is not yet
    if (endVertexId === null) {
      if (id === startVertexId) {
        // Clicking the same vertex again clears the start
        setStartVertexId(null);
        console.log('[Route] Cleared start vertex');
      } else {
        setEndVertexId(id);
        console.log(
          `[Route] Route selected: ${startVertexId} -> ${id}`
        );

        // Phase 2: as soon as start & end, run Dijkstra
        computeAndLogRoute(startVertexId, id);
      }
      return;
    }

    // Both start & end already set:
    // Treat any click as "restart route" from this vertex
    setStartVertexId(id);
    setEndVertexId(null);
    console.log(`[Route] Restarting route from: ${id}`);
  };

  const resetRoute = () => {
    setStartVertexId(null);
    setEndVertexId(null);
    console.log('[Route] Reset route selection');
  };

  return {
    startVertexId,
    endVertexId,
    handleVertexClickForRoute,
    resetRoute,
  };
}
