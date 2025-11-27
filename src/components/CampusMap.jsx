import { useMemo } from 'react';
import mapImg from '../assets/map.png';
import { createCampusGraph, MAP_WIDTH, MAP_HEIGHT } from '../helper/campusGraph.js';
import { worldToScreen } from '../helper/coordinates.js';
import VertexNode from './VertexNode.jsx';
import EdgeLayer from './EdgeLayer.jsx';
import MapControls from './MapControls.jsx';
import { useMapCamera } from '../hooks/useMapCamera.js';
import { useGraphEdit } from '../hooks/useGraphEdit.js';
import { useGraphHover } from '../hooks/useGraphHover.js';

const IS_EDITABLE       = false;
const IS_DEV_MODE       = import.meta.env.DEV;
const ENABLE_GRAPH_EDIT = IS_EDITABLE && IS_DEV_MODE;

function CampusMap() {
  const graph = useMemo(() => createCampusGraph(), []);

  // Graph edit tools (dev-only)
  const {
    selectedVertexId,
    handleVertexClick,
    handleMapClickWorld,
  } = useGraphEdit({
    graph,
    enabled: ENABLE_GRAPH_EDIT,
  });

  // Graph hover / visualization tools
  const {
    highlightedEdgeIds,
    getDegree,
    handleVertexHoverChange,
  } = useGraphHover(graph);

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
          />

          {/* Vertices on top */}
          {Object.values(graph.vertices).map((vertex) => {
            const screenPosition = worldToScreen(
              vertex.position,
              viewportSize,
              camera
            );

            const degree = getDegree(vertex.id);

            return (
              <VertexNode
                key={vertex.id}
                vertex={vertex}
                screenPosition={screenPosition}
                onClick={ENABLE_GRAPH_EDIT ? handleVertexClick : undefined}
                isSelected={
                  ENABLE_GRAPH_EDIT && selectedVertexId === vertex.id
                }
                onHoverChange={(isHovering) =>
                  handleVertexHoverChange(vertex.id, isHovering)
                }
                degree={degree}
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
