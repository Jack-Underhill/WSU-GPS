import { MAP_WIDTH, MAP_HEIGHT } from './campusGraph.js';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Given a camera (zoom + center), compute the visible world rectangle.
 * Returns world-space coordinates: top-left (x,y) plus width/height.
 */
export function getViewRect(camera) {
  const zoom    = camera?.zoom    ?? 1;
  const centerX = camera?.centerX ?? MAP_WIDTH  / 2;
  const centerY = camera?.centerY ?? MAP_HEIGHT / 2;

  const width  = MAP_WIDTH  / zoom;
  const height = MAP_HEIGHT / zoom;

  let x = centerX - width  / 2;
  let y = centerY - height / 2;

  // Clamp to never look outside the map bounds
  const maxX = MAP_WIDTH  - width;
  const maxY = MAP_HEIGHT - height;

  x = clamp(x, 0, Math.max(0, maxX));
  y = clamp(y, 0, Math.max(0, maxY));

  return { x, y, width, height };
}

/**
 * Convert a world-space position (in map coordinates) into screen-space
 * pixels, given the viewport size and a camera.
 */
export function worldToScreen(position, viewportSize, camera) {
  const { x, y } = position;
  const { width: vpW, height: vpH } = viewportSize;

  if (!vpW || !vpH) {
    return { x: 0, y: 0 };
  }

  const { x: viewX, y: viewY, width: viewW, height: viewH } = getViewRect(camera);

  // Map world → [0,1] within the current view rect
  const relX = (x - viewX) / viewW;
  const relY = (y - viewY) / viewH;

  // Finally, map [0,1] → pixels inside the viewport
  return {
    x: relX * vpW,
    y: relY * vpH,
  };
}

/**
 * Inverse of worldToScreen:
 * Convert a screen-space position (relative to the map viewport) into
 * world-space coordinates, given viewport size and camera.
 */
export function screenToWorld(screenPos, viewportSize, camera) {
  const { x: sx, y: sy } = screenPos;
  const { width: vpW, height: vpH } = viewportSize;

  if (!vpW || !vpH) {
    return { x: 0, y: 0 };
  }

  const { x: viewX, y: viewY, width: viewW, height: viewH } = getViewRect(camera);

  const relX = sx / vpW; // 0..1 across viewport
  const relY = sy / vpH; // 0..1 down viewport

  const worldX = viewX + relX * viewW;
  const worldY = viewY + relY * viewH;

  return { x: worldX, y: worldY };
}
