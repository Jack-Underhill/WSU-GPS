import { useRef, useState, useEffect } from 'react';

/**
 * Dev-only graph editor hook:
 * - TEMPLATE vertex creation (world click)
 * - TEMPLATE edge creation (vertex pair click)
 * - Enter -> dump code for TEMPLATE vertices & edges
 * - "u" -> undo last TEMPLATE vertex + its edges
 *
 * Assumes `graph` is a mutable graph object with:
 * - graph.vertices
 * - graph.edges
 * - graph.addVertex(...)
 * - graph.addEdge(...)
 */
export function useGraphEditor({ graph, enabled }) {
  // TEMPLATE vertex & edge ID counters
  const templateIdRef = useRef(1);
  const edgeIdRef     = useRef(1);

  // Currently selected vertex (for edge creation)
  const [selectedVertexId, setSelectedVertexId] = useState(null);

  // Dummy state to force re-renders when mutate `graph` in place
  const [, setTick] = useState(0);
  const bump = () => setTick((v) => v + 1);

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

    if (uVertex && vVertex) {
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

    bump();
    setSelectedVertexId(null);
  };

  /**
   * Keyboard shortcuts (dev editor):
   * - Enter: dump TEMPLATE vertices/edges as code
   * - "u": undo last TEMPLATE vertex and its incident edges
   */
  useEffect(() => {
    if (!enabled) return;
    if (!graph)   return;

    const handleKeyDown = (e) => {
      // ENTER -> dump all TEMPLATE vertices + edges as code
      if (e.key === 'Enter') {
        const vertices = Object.values(graph.vertices);
        const edges    = Object.values(graph.edges);

        const templateVertices = vertices.filter(
          (v) => v.name === 'TEMPLATE' || String(v.id).startsWith('TEMPLATE')
        );

        const templateEdges = edges.filter((edge) =>
          String(edge.id).startsWith('TEMPLATE_E')
        );

        if (templateVertices.length === 0 && templateEdges.length === 0) {
          console.log('// No TEMPLATE vertices or edges to dump');
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

        let output = '\n// TEMPLATE VERTICES\n';
        if (vertexLines.length > 0) {
          output += vertexLines.join('\n');
        } else {
          output += '// (none)';
        }

        output += '\n\n// TEMPLATE EDGES\n';
        if (edgeLines.length > 0) {
          output += edgeLines.join('\n');
        } else {
          output += '// (none)';
        }

        console.log(output);
        return;
      }

      // "u" -> undo last TEMPLATE vertex (and its edges)
      if (e.key === 'u' || e.key === 'U') {
        const vertices = Object.values(graph.vertices);

        const templateVertices = vertices.filter(
          (v) => v.name === 'TEMPLATE' || String(v.id).startsWith('TEMPLATE')
        );

        if (templateVertices.length === 0) {
          console.log('// No TEMPLATE vertex to undo');
          return;
        }

        // Find the TEMPLATE_* vertex with the highest numeric suffix
        let lastVertex = null;
        let lastNum    = -Infinity;

        for (const v of templateVertices) {
          const match = String(v.id).match(/^TEMPLATE_(\d+)$/);
          const num   = match ? parseInt(match[1], 10) : 0;
          if (num >= lastNum) {
            lastNum    = num;
            lastVertex = v;
          }
        }

        if (!lastVertex) {
          console.log('// Could not determine last TEMPLATE vertex to undo');
          return;
        }

        const vid = lastVertex.id;

        // Remove any edges that reference this vertex
        for (const [edgeId, edge] of Object.entries(graph.edges)) {
          if (edge.u === vid || edge.v === vid) {
            delete graph.edges[edgeId];
          }
        }

        // Remove the vertex itself
        delete graph.vertices[vid];

        // Clear selection if it was pointing at this vertex
        setSelectedVertexId((current) => (current === vid ? null : current));

        bump();

        console.log(`// Undid vertex ${vid} and its connected edges`);
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
