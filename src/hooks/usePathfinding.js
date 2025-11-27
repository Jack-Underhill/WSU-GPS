import { useState, useEffect } from 'react';
import { runDijkstra } from '../algorithms/dijkstra.js';

/**
 * Pathfinding:
 * - Track start/end vertices for a route.
 * - When both are chosen, run Dijkstra and record:
 *   - detailed traversal steps (for animation)
 *   - final shortest path (vertices/edges)
 *
 * Rendering order:
 * 1) Dijkstra runs instantly under the hood.
 * 2) Play the traversal "thinking" animation.
 * 3) When animation finishes, reveal the final path highlight.
 */
export function usePathfinding(graph) {
  const [startVertexId, setStartVertexId] = useState(null);
  const [endVertexId, setEndVertexId] = useState(null);

  // Visible final path (what CampusMap uses to highlight)
  const [pathVertexIds, setPathVertexIds] = useState([]);
  const [pathEdgeIds, setPathEdgeIds] = useState([]);

  // Pending final path (computed but not yet shown)
  const [pendingPathVertexIds, setPendingPathVertexIds] = useState([]);
  const [pendingPathEdgeIds, setPendingPathEdgeIds] = useState([]);

  // Traversal animation state
  const [traversalSteps, setTraversalSteps] = useState([]);
  const [activeTraverseVertexId, setActiveTraverseVertexId] = useState(null);
  const [activeTraverseEdgeId, setActiveTraverseEdgeId] = useState(null);

  const clearPathAndTraversal = () => {
    setPathVertexIds([]);
    setPathEdgeIds([]);
    setPendingPathVertexIds([]);
    setPendingPathEdgeIds([]);
    setTraversalSteps([]);
    setActiveTraverseVertexId(null);
    setActiveTraverseEdgeId(null);
  };

  const computeAndLogRoute = (startId, endId) => {
    if (!graph) return;

    try {
      const result = runDijkstra(graph, startId, endId);
      const {
        dist,
        pathVertices,
        pathEdges,
        visitedOrder,
        steps,
      } = result;

      if (!pathVertices.length || dist[endId] === Infinity) {
        console.log(
          `[Route] No path found from ${startId} to ${endId}.`
        );
        clearPathAndTraversal();
        return;
      }

      // Store final path as "pending" – not shown yet
      setPendingPathVertexIds(pathVertices);
      setPendingPathEdgeIds(pathEdges);

      // Store traversal steps for animation
      setTraversalSteps(steps || []);

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

      // If for some reason there are no steps to animate,
      // just show the final path immediately.
      if (!steps || steps.length === 0) {
        setPathVertexIds(pathVertices);
        setPathEdgeIds(pathEdges);
      }
    } catch (err) {
      console.error('[Route] Error running Dijkstra:', err);
      clearPathAndTraversal();
    }
  };

  const handleVertexClickForRoute = (vertex) => {
    if (!graph || !vertex) return;

    const id = vertex.id;

    // No start selected yet -> this becomes start
    if (startVertexId === null) {
      setStartVertexId(id);
      setEndVertexId(null);
      clearPathAndTraversal();
      console.log(`[Route] Start selected: ${id}`);
      return;
    }

    // Start is set, end is not yet
    if (endVertexId === null) {
      if (id === startVertexId) {
        // Clicking the same vertex again clears the start
        setStartVertexId(null);
        clearPathAndTraversal();
        console.log('[Route] Cleared start vertex');
      } else {
        setEndVertexId(id);
        console.log(
          `[Route] Route selected: ${startVertexId} -> ${id}`
        );

        // As soon as start & end are chosen, run Dijkstra
        computeAndLogRoute(startVertexId, id);
      }
      return;
    }

    // Both start & end already set:
    // Treat any click as "restart route" from this vertex
    setStartVertexId(id);
    setEndVertexId(null);
    clearPathAndTraversal();
    console.log(`[Route] Restarting route from: ${id}`);
  };

  const resetRoute = () => {
    setStartVertexId(null);
    setEndVertexId(null);
    clearPathAndTraversal();
    console.log('[Route] Reset route selection');
  };

  // Auto-play traversal steps when they change
  useEffect(() => {
    if (!traversalSteps || traversalSteps.length === 0) {
      setActiveTraverseVertexId(null);
      setActiveTraverseEdgeId(null);
      return;
    }

    let index = 0;

    const applyStep = (step) => {
      if (!step) return;
      if (step.type === 'visit-vertex') {
        setActiveTraverseVertexId(step.vertexId);
        setActiveTraverseEdgeId(null);
      } else if (step.type === 'consider-edge') {
        setActiveTraverseVertexId(step.from);
        setActiveTraverseEdgeId(step.edgeId);
      }
    };

    // Before animating: hide any previous final path
    setPathVertexIds([]);
    setPathEdgeIds([]);
    setActiveTraverseVertexId(null);
    setActiveTraverseEdgeId(null);

    // Apply first step immediately
    applyStep(traversalSteps[0]);

    const interval = setInterval(() => {
      index += 1;
      if (index >= traversalSteps.length) {
        clearInterval(interval);
        // After finishing, clear traversal highlight
        setActiveTraverseEdgeId(null);
        setActiveTraverseVertexId(null);

        // Now reveal the final path
        setPathVertexIds(pendingPathVertexIds);
        setPathEdgeIds(pendingPathEdgeIds);
        return;
      }
      applyStep(traversalSteps[index]);
    }, 50); // adjust speed as desired

    return () => {
      clearInterval(interval);
    };
  }, [traversalSteps, pendingPathVertexIds, pendingPathEdgeIds]);

  return {
    startVertexId,
    endVertexId,
    pathVertexIds,
    pathEdgeIds,
    activeTraverseVertexId,
    activeTraverseEdgeId,
    handleVertexClickForRoute,
    resetRoute,
  };
}
