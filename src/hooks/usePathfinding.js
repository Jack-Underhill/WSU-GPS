import { useState } from 'react';

/**
 * Phase 1: handle selecting start/end vertices for a route.
 * - Only concern right now: track start/end and log to console.
 * - No Dijkstra or highlighting yet.
 */
export function usePathfinding(graph) {
  const [startVertexId, setStartVertexId] = useState(null);
  const [endVertexId, setEndVertexId] = useState(null);

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
