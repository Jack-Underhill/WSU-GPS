import { useMemo, useEffect } from 'react';
import mapImg from '../assets/map.png';
import { createCampusGraph, MAP_WIDTH, MAP_HEIGHT } from '../helper/campusGraph.js';
import { worldToScreen } from '../helper/coordinates.js';
import VertexNode from './VertexNode.jsx';
import EdgeLayer from './EdgeLayer.jsx';
import MapControls from './MapControls.jsx';
import { useMapCamera } from '../hooks/useMapCamera.js';
import { useGraphEditor } from '../hooks/useGraphEditor.js';
import { useGraphHover } from '../hooks/useGraphHover.js';
import { usePathfinding } from '../hooks/usePathfinding.js';
import { searchVertices, suggestVertices } from '../helper/searchVertices.js';

const IS_EDITABLE       = false;
const IS_DEV_MODE       = import.meta.env.DEV;
const ENABLE_GRAPH_EDIT = IS_EDITABLE && IS_DEV_MODE;

function CampusMap({ 
  onRouteSelectionChange,
  startSearchQuery,
  endSearchQuery,
  startInputValue,
  endInputValue,
  onRouteSuggestionsChange, 
  startSuggestionsEnabled,
  endSuggestionsEnabled,
}) {
  const graph = useMemo(() => createCampusGraph(), []);

  // Graph edit tools (dev-only)
  const {
    selectedVertexId,
    handleVertexClick,
    handleMapClickWorld,
  } = useGraphEditor({
    graph,
    enabled: ENABLE_GRAPH_EDIT,
  });

  // Graph hover / visualization tools
  const {
    highlightedEdgeIds,
    getDegree,
    handleVertexHoverChange,
    hoveredEdgeId,
    handleEdgeHoverChange,
  } = useGraphHover(graph);

  // Pathfinding: selection + final path + traversal
  const {
    handleVertexClickForRoute,
    startVertexId,
    endVertexId,
    pathVertexIds,
    pathEdgeIds,
    activeTraverseVertexId,
    activeTraverseEdgeId,
    traversalVisitedVertexIds,
    selectRouteByVertexIds,
  } = usePathfinding(graph);

  // Notify parent (App) whenever start/end selection changes
  useEffect(() => {
    if (!onRouteSelectionChange) return;

    const startVertex = startVertexId ? graph.vertices[startVertexId] : null;
    const endVertex   = endVertexId   ? graph.vertices[endVertexId]   : null;

    let distance = null;
    if (Array.isArray(pathEdgeIds) && pathEdgeIds.length > 0) {
      distance = pathEdgeIds.reduce((sum, edgeId) => {
        const edge = graph.edges[edgeId];
        const w = edge && typeof edge.weight === "number" ? edge.weight : 0;
        return sum + w;
      }, 0);
    }

    onRouteSelectionChange({ startVertex, endVertex, distance });
  }, [startVertexId, endVertexId, pathEdgeIds, graph, onRouteSelectionChange]);

  // Live suggestions: on each keystroke, compute up to 4 ranked vertex suggestions
  useEffect(() => {
    if (!onRouteSuggestionsChange) return;

    const startSuggestions = startSuggestionsEnabled && startInputValue
      ? suggestVertices(graph, startInputValue)
      : [];

    const endSuggestions = endSuggestionsEnabled && endInputValue
      ? suggestVertices(graph, endInputValue)
      : [];

    onRouteSuggestionsChange({ startSuggestions, endSuggestions });
  }, [
    startInputValue, 
    endInputValue, 
    graph, 
    onRouteSuggestionsChange,
    startSuggestionsEnabled,
    endSuggestionsEnabled,
  ]);

  // Search: when navbar commits a query, try to match a vertex by name/id
  useEffect(() => {
    if (!startSearchQuery && !endSearchQuery) return;

    const { startVertex, endVertex } = searchVertices(graph, {
      startQuery: startSearchQuery,
      endQuery: endSearchQuery,
    });

    let newStartId;
    let newEndId;

    if (startSearchQuery) {
      if (startVertex) {
        newStartId = startVertex.id;
      } else {
        console.log("[Search] No vertex found for start:", startSearchQuery);
      }
    }

    if (endSearchQuery) {
      if (endVertex) {
        newEndId = endVertex.id;
      } else {
        console.log("[Search] No vertex found for end:", endSearchQuery);
      }
    }

    // If either side matched, update the route
    if (newStartId || newEndId) {
      selectRouteByVertexIds(newStartId, newEndId);
    }
  }, [startSearchQuery, endSearchQuery]);

  // Camera + viewport handled by custom hook
  const {
    containerRef,
    viewportSize,
    camera,
    mapStyle,
    isPanning,
    handleMouseDown,
    handleZoomIn,
    handleZoomOut,
  } = useMapCamera({
    mapWidth:           MAP_WIDTH,
    mapHeight:          MAP_HEIGHT,
    enableClickToWorld: ENABLE_GRAPH_EDIT,
    onMapClickWorld:    handleMapClickWorld,
  });

  // Decide what a vertex click *means*:
  // - In edit mode: create edges (dev editor).
  // - In normal mode: select start/end for route.
  const vertexOnClick = ENABLE_GRAPH_EDIT
    ? handleVertexClick
    : handleVertexClickForRoute;

  const pathVertexSet = new Set(pathVertexIds);
  const traversalVisitedSet = new Set(traversalVisitedVertexIds);

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
          <EdgeLayer
            graph={graph}
            viewportSize={viewportSize}
            camera={camera}
            highlightedEdgeIds={highlightedEdgeIds}
            hoveredEdgeId={hoveredEdgeId}
            onEdgeHoverChange={handleEdgeHoverChange}
            pathEdgeIds={pathEdgeIds}
            activeTraverseEdgeId={activeTraverseEdgeId}
          />

          {/* Vertices on top */}
          {Object.values(graph.vertices).map((vertex) => {
            const screenPosition = worldToScreen(
              vertex.position,
              viewportSize,
              camera
            );

            const degree = getDegree(vertex.id);
            const isOnPath = pathVertexSet.has(vertex.id);
            const isRouteStart = startVertexId === vertex.id;
            const isRouteEnd = endVertexId === vertex.id;
            const isTraversalActive = activeTraverseVertexId === vertex.id;
            const isTraversalVisited = traversalVisitedSet.has(vertex.id);

            return (
              <VertexNode
                key={vertex.id}
                vertex={vertex}
                screenPosition={screenPosition}
                onClick={vertexOnClick}
                isSelected={
                  ENABLE_GRAPH_EDIT && selectedVertexId === vertex.id
                }
                onHoverChange={(isHovering) =>
                  handleVertexHoverChange(vertex.id, isHovering)
                }
                degree={degree}
                isOnPath={isOnPath}
                isRouteStart={isRouteStart}
                isRouteEnd={isRouteEnd}
                isTraversalActive={isTraversalActive}
                isTraversalVisited={isTraversalVisited}
              />
            );
          })}

          {/* Map UI overlay (zoom controls) */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            zoom={camera.zoom}
          />
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
