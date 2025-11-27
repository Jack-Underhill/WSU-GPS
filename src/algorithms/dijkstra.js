/**
 * Run Dijkstra on your graph from startId to targetId.
 * graph:
 *  - graph.vertices: { [id]: vertex }
 *  - graph.getNeighbors(id): [{ to, weight, edgeId }]
 */
export function runDijkstra(graph, startId, targetId) {
  if (!graph || !graph.vertices || !graph.getNeighbors) {
    throw new Error('runDijkstra: invalid graph');
  }

  const vertexIds = Object.keys(graph.vertices);
  if (!vertexIds.includes(startId) || !vertexIds.includes(targetId)) {
    throw new Error(
      `runDijkstra: start or target not in graph (${startId} -> ${targetId})`
    );
  }

  const dist = {};
  const prev = {}; // vertexId -> { from, edgeId } | null
  const visited = new Set();
  const visitedOrder = [];
  const steps = []; // detailed traversal steps

  for (const id of vertexIds) {
    dist[id] = Infinity;
    prev[id] = null;
  }
  dist[startId] = 0;

  while (visited.size < vertexIds.length) {
    // Pick the unvisited vertex with smallest distance
    let u = null;
    let minDist = Infinity;

    for (const id of vertexIds) {
      if (!visited.has(id) && dist[id] < minDist) {
        minDist = dist[id];
        u = id;
      }
    }

    if (u === null || dist[u] === Infinity) {
      // Remaining vertices are unreachable
      break;
    }

    visited.add(u);
    visitedOrder.push(u);

    // Step: now "visiting" u
    steps.push({
      type: 'visit-vertex',
      vertexId: u,
    });

    if (u === targetId) {
      // Stop once finalized the target
      break;
    }

    const neighbors = graph.getNeighbors(u) || [];
    for (const { to: v, weight, edgeId } of neighbors) {
      if (visited.has(v)) continue;

      const prevDist = dist[v];
      const alt = dist[u] + weight;
      const improved = alt < prevDist;

      // Step: considering edge (u -> v)
      steps.push({
        type: 'consider-edge',
        from: u,
        to: v,
        edgeId,
        prevDist,
        newDist: alt,
        improved,
      });

      if (improved) {
        dist[v] = alt;
        prev[v] = { from: u, edgeId };
      }
    }
  }

  // Reconstruct shortest path from startId to targetId
  const pathVertices = [];
  const pathEdges = [];

  if (dist[targetId] !== Infinity) {
    let current = targetId;
    while (current != null) {
      pathVertices.unshift(current);
      if (current === startId) break;

      const step = prev[current];
      if (!step) break;
      pathEdges.unshift(step.edgeId);
      current = step.from;
    }
  }

  return {
    dist,
    prev,
    visitedOrder,
    pathVertices,
    pathEdges,
    steps,
  };
}
