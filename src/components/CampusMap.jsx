import { useRef, useState, useMemo, useEffect } from 'react';
import mapImg from '../assets/map.png';
import { createCampusGraph, MAP_WIDTH, MAP_HEIGHT } from '../helper/campusGraph.js';
import { worldToScreen, getViewRect } from '../helper/coordinates.js';
import VertexNode  from './VertexNode.jsx';
import EdgeLayer   from './EdgeLayer.jsx';
import MapControls from './MapControls.jsx';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

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

  // Derived camera object for worldToScreen()
  const camera = {
    zoom,
    centerX: center.x,
    centerY: center.y,
  };

  /* Measure the rendered map container so we know the viewport size */
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

  // Compute transform for the map image so it matches the camera
  const hasViewport = viewportSize.width > 0 && viewportSize.height > 0;
  let mapStyle = {};

  if (hasViewport) {
    const { x: viewX, y: viewY } = getViewRect(camera);
    const scale = zoom;

    // How many screen pixels correspond to 1 world unit at base zoom
    const pxPerWorldX = viewportSize.width  / MAP_WIDTH;
    const pxPerWorldY = viewportSize.height / MAP_HEIGHT;

    // We want: px = scale * (worldX * pxPerWorldX) - scale * (viewX * pxPerWorldX)
    // → so we translate by the negative of the second term.
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
        {/* Background map (now camera-aware via CSS transform) */}
        <img
          src={mapImg}
          alt="WSU Pullman Campus Map"
          className="block max-w-full h-auto"
          style={mapStyle}
        />

        {/* Graph overlays + controls */}
        <div className="absolute inset-0">
          {/* Edges first so they render under the nodes */}
          <EdgeLayer
            graph={graph}
            viewportSize={viewportSize}
            camera={camera}
          />

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
