import { useRef, useState, useEffect } from 'react';

/**
 * Dev-only graph editor hook:
 * - TEMPLATE vertex creation (world click)
 * - TEMPLATE edge creation (vertex pair click)
 * - Enter -> dump code for *session-created* TEMPLATE vertices & edges
 * - "u" -> undo last *session-created* TEMPLATE vertex + its edges
 *
 * Assumes `graph` is a mutable graph object with:
 * - graph.vertices
 * - graph.edges
 * - graph.addVertex(...)
 * - graph.addEdge(...)
 */
export function useGraphEditor({ graph, enabled }) {
  // TEMPLATE vertex & edge ID counters (seed them from existing IDs)
  const templateIdRef = useRef(1);
  const edgeIdRef     = useRef(1);

  // Track only what this editor session creates
  const createdVertexIdsRef  = useRef(new Set());  // IDs of vertices created via this hook
  const createdEdgeIdsRef    = useRef(new Set());  // IDs of edges created via this hook
  const createdVertexStackRef = useRef([]);        // ordered stack for "u" undo

  // Currently selected vertex (for edge creation)
  const [selectedVertexId, setSelectedVertexId] = useState(null);

  // Dummy state to force re-renders when mutate `graph` in place
  const [, setTick] = useState(0);
  const bump = () => setTick((v) => v + 1);

  // Make sure only scan existing graph once
  const initializedRef = useRef(false);

  /**
   * Initialize counters based on existing TEMPLATE_* IDs so don't collide
   * with TEMPLATE vertices/edges already stored in the graph file.
   */
  useEffect(() => {
    if (!enabled) return;
    if (!graph)   return;
    if (initializedRef.current) return;

    let maxTemplateNum = 0;
    let maxEdgeNum     = 0;

    // Look at existing vertices for TEMPLATE_* ids
    for (const v of Object.values(graph.vertices)) {
      const match = String(v.id).match(/^TEMPLATE_(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!Number.isNaN(num) && num > maxTemplateNum) {
          maxTemplateNum = num;
        }
      }
    }

    // Look at existing edges for TEMPLATE_E* ids
    for (const e of Object.values(graph.edges)) {
      const match = String(e.id).match(/^TEMPLATE_E(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!Number.isNaN(num) && num > maxEdgeNum) {
          maxEdgeNum = num;
        }
      }
    }

    templateIdRef.current = maxTemplateNum + 1;
    edgeIdRef.current     = maxEdgeNum + 1;

    initializedRef.current = true;
  }, [enabled, graph]);

  /**
   * Called when the user clicks on the MAP (in world coords),
   * not on a vertex. Create a new TEMPLATE vertex there.
   */
  const handleMapClickWorld = (worldPos) => {
    if (!enabled) return;
    if (!graph)   return;

    const worldX = Math.round(worldPos.x);
    const worldY = Math.round(worldPos.y);

    const idNumber = templateIdRef.current++;
    const id       = `TEMPLATE_${idNumber}`;

    graph.addVertex({
      id,
      name:       'TEMPLATE',
      x:          worldX,
      y:          worldY,
      isTerminal: false,
    });

    // Track as "session-created"
    createdVertexIdsRef.current.add(id);
    createdVertexStackRef.current.push(id);

    bump();
  };

  /**
   * Called when a vertex is clicked in edit mode.
   * First click picks "u", second click picks "v" and creates TEMPLATE edge.
   */
  const handleVertexClick = (vertex) => {
    if (!enabled) return;
    if (!graph || !vertex) return;

    const id = vertex.id;

    // First click: select start vertex (u)
    if (!selectedVertexId) {
      setSelectedVertexId(id);
      return;
    }

    // Clicking same vertex again: clear selection
    if (selectedVertexId === id) {
      setSelectedVertexId(null);
      return;
    }

    // Second vertex clicked: create an edge from selectedVertexId -> id
    const u = selectedVertexId;
    const v = id;

    const uVertex = graph.vertices[u];
    const vVertex = graph.vertices[v];

    let weight = 60;

    if (uVertex && vVertex && uVertex.position && vVertex.position) {
      const dx       = uVertex.position.x - vVertex.position.x;
      const dy       = uVertex.position.y - vVertex.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      weight         = Math.round(distance);
    }

    const edgeNumber = edgeIdRef.current++;
    const edgeId     = `TEMPLATE_E${edgeNumber}`;

    graph.addEdge({
      id: edgeId,
      u,
      v,
      weight,
    });

    // Track as "session-created"
    createdEdgeIdsRef.current.add(edgeId);

    bump();
    setSelectedVertexId(null);
  };

  /**
   * Keyboard shortcuts (dev editor):
   * - Enter: dump *session-created* TEMPLATE vertices/edges as code
   * - "u": undo last *session-created* TEMPLATE vertex and its incident edges
   */
  useEffect(() => {
    if (!enabled) return;
    if (!graph)   return;

    const handleKeyDown = (e) => {
      // ENTER -> dump only the vertices/edges created by this editor session
      if (e.key === 'Enter') {
        const vertexIds = Array.from(createdVertexIdsRef.current);
        const edgeIds   = Array.from(createdEdgeIdsRef.current);

        const templateVertices = vertexIds
          .map((id) => graph.vertices[id])
          .filter(Boolean);

        const templateEdges = edgeIds
          .map((id) => graph.edges[id])
          .filter(Boolean);

        if (templateVertices.length === 0 && templateEdges.length === 0) {
          console.log('// No new TEMPLATE vertices or edges to dump');
          return;
        }

        const vertexLines = templateVertices.map(
          (v) =>
            `g.addVertex({ id: '${v.id}', name: 'TEMPLATE', x: ${v.position.x}, y: ${v.position.y}, isTerminal: ${v.isTerminal} });`
        );

        const edgeLines = templateEdges.map(
          (edge) =>
            `g.addEdge({ id: '${edge.id}', u: '${edge.u}', v: '${edge.v}', weight: ${edge.weight} });`
        );

        let output = '\n// TEMPLATE VERTICES (session-created)\n';
        if (vertexLines.length > 0) {
          output += vertexLines.join('\n');
        } else {
          output += '// (none)';
        }

        output += '\n\n// TEMPLATE EDGES (session-created)\n';
        if (edgeLines.length > 0) {
          output += edgeLines.join('\n');
        } else {
          output += '// (none)';
        }

        console.log(output);
        return;
      }

      // "u" -> undo last *session-created* TEMPLATE vertex (and its edges)
      if (e.key === 'u' || e.key === 'U') {
        const stack = createdVertexStackRef.current;
        if (stack.length === 0) {
          console.log('// No session-created TEMPLATE vertex to undo');
          return;
        }

        const vid = stack.pop();

        // Remove any edges that reference this vertex
        for (const [edgeId, edge] of Object.entries(graph.edges)) {
          if (edge.u === vid || edge.v === vid) {
            delete graph.edges[edgeId];
            createdEdgeIdsRef.current.delete(edgeId);
          }
        }

        // Remove the vertex itself
        delete graph.vertices[vid];
        createdVertexIdsRef.current.delete(vid);

        // Clear selection if it was pointing at this vertex
        setSelectedVertexId((current) => (current === vid ? null : current));

        bump();

        console.log(`// Undid vertex ${vid} and its connected edges (session-created)`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, graph]);

  return {
    selectedVertexId,
    handleVertexClick,
    handleMapClickWorld,
  };
}
