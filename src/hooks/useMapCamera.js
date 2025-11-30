import { useState, useRef, useEffect, useMemo } from 'react';
import { getViewRect, screenToWorld } from '../helper/coordinates.js';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Handles:
 * - camera state (zoom, center)
 * - viewport measurement
 * - panning via mouse drag
 * - optional click -> world callback for edit mode
 */
export function useMapCamera({
  mapWidth,
  mapHeight,
  enableClickToWorld = false,
  onMapClickWorld,
}) {
  const containerRef = useRef(null);

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const [zoom,   setZoom]   = useState(1);
  const [center, setCenter] = useState({
    x: mapWidth  / 2,
    y: mapHeight / 2,
  });

  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const movedRef        = useRef(false);

  // Touch / mobile gesture state
  const lastTouchPosRef       = useRef({ x: 0, y: 0 });
  const pinchStartDistanceRef = useRef(null);
  const pinchStartZoomRef     = useRef(1);

  // Measure container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({
        width:  rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const camera = useMemo(
    () => ({
      zoom,
      centerX: center.x,
      centerY: center.y,
    }),
    [zoom, center.x, center.y]
  );

  const handleZoomIn = () => {
    setZoom((z) => clamp(z * 1.25, MIN_ZOOM, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((z) => clamp(z / 1.25, MIN_ZOOM, MAX_ZOOM));
  };

  const handleMouseDown = (e) => {
    // Only left-click
    if (e.button !== 0) return;
    e.preventDefault();

    setIsPanning(true);
    movedRef.current        = false;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Capture snapshot for this drag
    const startZoom     = zoom;
    const startViewport = { ...viewportSize };
    const startCenter   = { ...center };
    const startCamera   = {
      zoom:    startZoom,
      centerX: startCenter.x,
      centerY: startCenter.y,
    };

    const handleWindowMouseMove = (moveEvent) => {
      if (!startViewport.width || !startViewport.height) return;

      const prev = lastMousePosRef.current;
      const dx   = moveEvent.clientX - prev.x;
      const dy   = moveEvent.clientY - prev.y;

      if (dx === 0 && dy === 0) return;

      lastMousePosRef.current = {
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };

      if (!movedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        movedRef.current = true;
      }

      // Pan the camera
      setCenter((prevCenter) => {
        const viewWidth  = mapWidth  / startZoom;
        const viewHeight = mapHeight / startZoom;

        const worldPerPixelX = viewWidth  / startViewport.width;
        const worldPerPixelY = viewHeight / startViewport.height;

        let newX = prevCenter.x - dx * worldPerPixelX;
        let newY = prevCenter.y - dy * worldPerPixelY;

        const minX = viewWidth / 2;
        const maxX = mapWidth - viewWidth / 2;
        const minY = viewHeight / 2;
        const maxY = mapHeight - viewHeight / 2;

        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);

        return { x: newX, y: newY };
      });
    };

    const handleWindowMouseUp = (upEvent) => {
      setIsPanning(false);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup',   handleWindowMouseUp);

      // If not actually drag -> treat as a map click
      if (
        enableClickToWorld &&
        !movedRef.current &&
        containerRef.current &&
        typeof onMapClickWorld === 'function'
      ) {
        const rect = containerRef.current.getBoundingClientRect();
        const screenX = upEvent.clientX - rect.left;
        const screenY = upEvent.clientY - rect.top;

        const worldPos = screenToWorld(
          { x: screenX, y: screenY },
          startViewport,
          startCamera
        );

        onMapClickWorld(worldPos);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup',   handleWindowMouseUp);
  };

  // --- Touch / mobile gestures ------------------------------------
  const handleTouchStart = (e) => {
    if (!containerRef.current) return;

    // handle both 1-finger pan and 2-finger pinch
    if (e.touches.length === 1 || e.touches.length === 2) {
      e.preventDefault();
    }

    if (e.touches.length === 1) {
      // Start panning
      const t = e.touches[0];
      lastTouchPosRef.current = { x: t.clientX, y: t.clientY };
      pinchStartDistanceRef.current = null;
      pinchStartZoomRef.current = zoom;

      movedRef.current = false;
      setIsPanning(true);
    } else if (e.touches.length === 2) {
      // Start pinch
      const [t1, t2] = e.touches;
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.hypot(dx, dy) || 0.0001;

      pinchStartDistanceRef.current = dist;
      pinchStartZoomRef.current     = zoom;

      setIsPanning(false);
    }
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;

    // 1 finger => pan
    if (e.touches.length === 1 && !pinchStartDistanceRef.current) {
      const t = e.touches[0];
      const prev = lastTouchPosRef.current;
      const dx = t.clientX - prev.x;
      const dy = t.clientY - prev.y;

      if (dx === 0 && dy === 0) return;

      e.preventDefault();

      lastTouchPosRef.current = { x: t.clientX, y: t.clientY };

      if (!movedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        movedRef.current = true;
      }

      // Pan using current zoom + viewport
      setCenter((prevCenter) => {
        if (!viewportSize.width || !viewportSize.height) {
          return prevCenter;
        }

        const viewWidth  = mapWidth  / zoom;
        const viewHeight = mapHeight / zoom;

        const worldPerPixelX = viewWidth  / viewportSize.width;
        const worldPerPixelY = viewHeight / viewportSize.height;

        let newX = prevCenter.x - dx * worldPerPixelX;
        let newY = prevCenter.y - dy * worldPerPixelY;

        const minX = viewWidth / 2;
        const maxX = mapWidth - viewWidth / 2;
        const minY = viewHeight / 2;
        const maxY = mapHeight - viewHeight / 2;

        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);

        return { x: newX, y: newY };
      });
    }
    // 2 fingers => pinch zoom
    else if (e.touches.length === 2) {
      const [t1, t2] = e.touches;
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const distance = Math.hypot(dx, dy) || 0.0001;

      const startDistance = pinchStartDistanceRef.current;
      if (!startDistance) {
        pinchStartDistanceRef.current = distance;
        return;
      }

      e.preventDefault();

      const scale    = distance / startDistance;
      const baseZoom = pinchStartZoomRef.current || zoom;

      setZoom(() =>
        clamp(baseZoom * scale, MIN_ZOOM, MAX_ZOOM)
      );
    }
  };

  const handleTouchEnd = (e) => {
    if (!containerRef.current) return;

    // Gesture finished
    if (e.touches.length === 0) {
      setIsPanning(false);

      // Treat as "tap" -> world click if didn't drag
      if (
        enableClickToWorld &&
        !movedRef.current &&
        typeof onMapClickWorld === 'function'
      ) {
        const rect  = containerRef.current.getBoundingClientRect();
        const touch = e.changedTouches[0];

        if (touch) {
          const screenX = touch.clientX - rect.left;
          const screenY = touch.clientY - rect.top;

          const worldPos = screenToWorld(
            { x: screenX, y: screenY },
            viewportSize,
            camera
          );

          onMapClickWorld(worldPos);
        }
      }

      pinchStartDistanceRef.current = null;
    }
    // Went from 2 fingers to 1 finger -> start panning from remaining finger
    else if (e.touches.length === 1) {
      const t = e.touches[0];
      lastTouchPosRef.current = { x: t.clientX, y: t.clientY };
      pinchStartDistanceRef.current = null;
      pinchStartZoomRef.current     = zoom;
      movedRef.current              = false;
      setIsPanning(true);
    }
  };


  // Map image transform style
  const mapStyle = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) return {};

    const { x: viewX, y: viewY } = getViewRect(camera);
    const scale = camera.zoom;

    const pxPerWorldX = viewportSize.width  / mapWidth;
    const pxPerWorldY = viewportSize.height / mapHeight;

    const offsetX = -viewX * pxPerWorldX * scale;
    const offsetY = -viewY * pxPerWorldY * scale;

    return {
      transformOrigin: 'top left',
      transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    };
  }, [viewportSize, camera, mapWidth, mapHeight]);

  return {
    containerRef,
    viewportSize,
    camera,
    mapStyle,
    isPanning,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleZoomIn,
    handleZoomOut,
  };
}
