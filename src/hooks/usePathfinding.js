import { useState } from 'react';
import { runDijkstra } from '../algorithms/dijkstra.js';

/**
 * Phase 3:
 * - Track start/end vertices for a route.
 * - When both are chosen, run Dijkstra, log the path,
 *   and store the final path vertex/edge IDs for highlighting.
 */
export function usePathfinding(graph) {
  const [startVertexId, setStartVertexId] = useState(null);
  const [endVertexId, setEndVertexId] = useState(null);
  const [pathVertexIds, setPathVertexIds] = useState([]);
  const [pathEdgeIds, setPathEdgeIds] = useState([]);

  const clearPath = () => {
    setPathVertexIds([]);
    setPathEdgeIds([]);
  };

  const computeAndLogRoute = (startId, endId) => {
    if (!graph) return;

    try {
      const result = runDijkstra(graph, startId, endId);
      const { dist, pathVertices, pathEdges, visitedOrder } = result;

      if (!pathVertices.length || dist[endId] === Infinity) {
        console.log(
          `[Route] No path found from ${startId} to ${endId}.`
        );
        clearPath();
        return;
      }

      // Store final path for highlighting
      setPathVertexIds(pathVertices);
      setPathEdgeIds(pathEdges);

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
      clearPath();
    }
  };

  const handleVertexClickForRoute = (vertex) => {
    if (!graph || !vertex) return;

    const id = vertex.id;

    // No start selected yet -> this becomes start
    if (startVertexId === null) {
      setStartVertexId(id);
      setEndVertexId(null);
      clearPath();
      console.log(`[Route] Start selected: ${id}`);
      return;
    }

    // Start is set, end is not yet
    if (endVertexId === null) {
      if (id === startVertexId) {
        // Clicking the same vertex again clears the start
        setStartVertexId(null);
        clearPath();
        console.log('[Route] Cleared start vertex');
      } else {
        setEndVertexId(id);
        console.log(
          `[Route] Route selected: ${startVertexId} -> ${id}`
        );

        // As soon as start & end, run Dijkstra
        computeAndLogRoute(startVertexId, id);
      }
      return;
    }

    // Both start & end already set:
    // Treat any click as "restart route" from this vertex
    setStartVertexId(id);
    setEndVertexId(null);
    clearPath();
    console.log(`[Route] Restarting route from: ${id}`);
  };

  const resetRoute = () => {
    setStartVertexId(null);
    setEndVertexId(null);
    clearPath();
    console.log('[Route] Reset route selection');
  };

  return {
    startVertexId,
    endVertexId,
    pathVertexIds,
    pathEdgeIds,
    handleVertexClickForRoute,
    resetRoute,
  };
}
