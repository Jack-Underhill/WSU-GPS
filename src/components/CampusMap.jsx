import { useRef, useState, useMemo, useEffect } from 'react';
import mapImg from '../assets/map.png';
import { createCampusGraph, MAP_WIDTH, MAP_HEIGHT } from '../helper/campusGraph.js';
import { worldToScreen, getViewRect, screenToWorld } from '../helper/coordinates.js';
import VertexNode from './VertexNode.jsx';
import EdgeLayer from './EdgeLayer.jsx';
import MapControls from './MapControls.jsx';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

// Edit mode only in dev builds
const IS_EDITABLE = false;
const IS_DEV_MODE = import.meta.env.DEV;
const ENABLE_GRAPH_EDIT = IS_EDITABLE && IS_DEV_MODE;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function CampusMap() {
  const graph = useMemo(() => createCampusGraph(), []);
  const containerRef = useRef(null);

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Camera state: zoom + center (in world coordinates)
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2,
  });

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false); // track if actually dragged

  // For template vertex IDs
  const templateIdRef = useRef(1);
  // For template edge IDs
  const edgeIdRef = useRef(1);

  // Force rerender when mutate graph in-place
  const [graphVersion, setGraphVersion] = useState(0);

  // Edge-creation selection state: first vertex clicked for an edge
  const [selectedVertexId, setSelectedVertexId] = useState(null);

  // Derived camera object for worldToScreen()
  const camera = {
    zoom,
    centerX: center.x,
    centerY: center.y,
  };

  /* Dump all TEMPLATE vertices + edges as code on Enter,
     and undo last TEMPLATE vertex on "u" */
  useEffect(() => {
    if (!ENABLE_GRAPH_EDIT) return;

    const handleKeyDown = (e) => {
      // ENTER → dump all TEMPLATE vertices + edges as code
      if (e.key === 'Enter') {
        const vertices = Object.values(graph.vertices);
        const edges = Object.values(graph.edges);

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

      // "u" → undo last TEMPLATE vertex (and its edges)
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
        let lastNum = -Infinity;

        for (const v of templateVertices) {
          const match = String(v.id).match(/^TEMPLATE_(\d+)$/);
          const num = match ? parseInt(match[1], 10) : 0;
          if (num >= lastNum) {
            lastNum = num;
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

        // Force rerender so changes show up
        setGraphVersion((v) => v + 1);

        console.log(`// Undid vertex ${vid} and its connected edges`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [graph]);

  /* Measure the rendered map container to know the viewport size */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({
        width: rect.width,
        height: rect.height,
      });
    };

    // Run once on mount
    updateSize();

    // Watch for resizes of this element
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Zoom controls (for + / - buttons)
  const handleZoomIn = () => {
    setZoom((z) => clamp(z * 1.25, MIN_ZOOM, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((z) => clamp(z / 1.25, MIN_ZOOM, MAX_ZOOM));
  };

  // --- Vertex click handler (for edge creation in edit mode) ---
  const handleVertexClick = (vertex) => {
    if (!ENABLE_GRAPH_EDIT) return;

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

    // Fallback in case something is weird, but in normal flow both exist
    let weight = 60;

    if (uVertex && vVertex) {
      const dx = uVertex.position.x - vVertex.position.x;
      const dy = uVertex.position.y - vVertex.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Use rounded distance as the edge weight
      weight = Math.round(distance);
    }

    const edgeNumber = edgeIdRef.current++;
    const edgeId = `TEMPLATE_E${edgeNumber}`;

    graph.addEdge({
      id: edgeId,
      u,
      v,
      weight,
      // directed: false  // omitted -> defaults to false in edge()
    });

    // Force rerender so new edge appears
    setGraphVersion((ver) => ver + 1);

    // Reset selection for the next edge
    setSelectedVertexId(null);
  };

  // Mouse-based panning with window-level listeners + click-to-create vertices
  const handleMouseDown = (e) => {
    // Only left-click
    if (e.button !== 0) return;
    e.preventDefault();

    setIsPanning(true);
    movedRef.current = false;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Capture current zoom/viewport at drag start for panning math
    const startZoom = zoom;
    const startViewport = { ...viewportSize };

    const handleWindowMouseMove = (moveEvent) => {
      if (!startViewport.width || !startViewport.height) return;

      const prev = lastMousePosRef.current;
      const dx = moveEvent.clientX - prev.x;
      const dy = moveEvent.clientY - prev.y;

      if (dx === 0 && dy === 0) return;

      lastMousePosRef.current = {
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };

      // If movement surpasses a tiny threshold, treat it as a drag
      if (!movedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        movedRef.current = true;
      }

      // Pan the camera
      setCenter((prevCenter) => {
        const viewWidth = MAP_WIDTH / startZoom;
        const viewHeight = MAP_HEIGHT / startZoom;

        const worldPerPixelX = viewWidth / startViewport.width;
        const worldPerPixelY = viewHeight / startViewport.height;

        // Drag left → see more to the right, so subtract dx
        let newX = prevCenter.x - dx * worldPerPixelX;
        let newY = prevCenter.y - dy * worldPerPixelY;

        // Clamp camera so we never go outside map bounds
        const minX = viewWidth / 2;
        const maxX = MAP_WIDTH - viewWidth / 2;
        const minY = viewHeight / 2;
        const maxY = MAP_HEIGHT - viewHeight / 2;

        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);

        return { x: newX, y: newY };
      });
    };

    const handleWindowMouseUp = (upEvent) => {
      setIsPanning(false);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);

      // If we didn't actually drag, treat this as a click on the MAP (not on a vertex) → create a TEMPLATE vertex
      if (ENABLE_GRAPH_EDIT && !movedRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const screenX = upEvent.clientX - rect.left; // relative to map viewport
        const screenY = upEvent.clientY - rect.top;

        const worldPos = screenToWorld(
          { x: screenX, y: screenY },
          viewportSize,
          camera
        );

        // Round to integers for nicer console copy/paste
        const worldX = Math.round(worldPos.x);
        const worldY = Math.round(worldPos.y);

        // Auto-generate an ID and create the vertex in the graph
        const idNumber = templateIdRef.current++;
        const id = `TEMPLATE_${idNumber}`;

        graph.addVertex({
          id,
          name: 'TEMPLATE',
          x: worldX,
          y: worldY,
          isTerminal: false,
        });

        // Force a rerender so the new vertex appears
        setGraphVersion((v) => v + 1);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Compute transform for the map image so it matches the camera
  const hasViewport = viewportSize.width > 0 && viewportSize.height > 0;
  let mapStyle = {};

  if (hasViewport) {
    const { x: viewX, y: viewY } = getViewRect(camera);
    const scale = zoom;

    // How many screen pixels correspond to 1 world unit at base zoom
    const pxPerWorldX = viewportSize.width / MAP_WIDTH;
    const pxPerWorldY = viewportSize.height / MAP_HEIGHT;

    // We want: px = scale * (worldX * pxPerWorldX) - scale * (viewX * pxPerWorldX)
    const offsetX = -viewX * pxPerWorldX * scale;
    const offsetY = -viewY * pxPerWorldY * scale;

    mapStyle = {
      transformOrigin: 'top left',
      transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    };
  }

  return (
    <div className="flex justify-center items-center bg-slate-900">
      <div ref={containerRef} className="relative inline-block overflow-hidden">
        {/* Background map (camera-aware via CSS transform) */}
        <img
          src={mapImg}
          alt="WSU Pullman Campus Map"
          className="block max-w-full h-auto select-none"
          style={mapStyle}
          draggable={false}
        />

        {/* Graph overlays + controls */}
        <div
          className={`absolute inset-0 ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Edges first so they render under the nodes */}
          <EdgeLayer graph={graph} viewportSize={viewportSize} camera={camera} />

          {/* Vertices on top */}
          {Object.values(graph.vertices).map((vertex) => {
            const screenPosition = worldToScreen(
              vertex.position,
              viewportSize,
              camera
            );

            return (
              <VertexNode
                key={vertex.id}
                vertex={vertex}
                screenPosition={screenPosition}
                onClick={ENABLE_GRAPH_EDIT ? handleVertexClick : undefined}
                isSelected={
                  ENABLE_GRAPH_EDIT && selectedVertexId === vertex.id
                }
              />
            );
          })}

          {/* Map UI overlay (zoom controls) */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            zoom={zoom}
          />
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
