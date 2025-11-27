/**
 * "Dumb" vertex search for now:
 * - case-insensitive
 * - prefers exact match on id or name
 * - falls back to startsWith on id or name
 *
 * Returns the matched vertex objects (or null).
 */
export function searchVertices(graph, { startQuery, endQuery } = {}) {
  const vertices = Object.values(graph.vertices ?? {});

  const normalize = (q) => (q || "").trim().toLowerCase();

  const findVertex = (rawQuery) => {
    const q = normalize(rawQuery);
    if (!q) return null;

    // 1) exact match on id or name
    let match =
      vertices.find(
        (v) =>
          v.id.toLowerCase() === q ||
          (v.name && v.name.toLowerCase() === q)
      ) ||
      // 2) fallback: startsWith on id or name
      vertices.find(
        (v) =>
          v.id.toLowerCase().startsWith(q) ||
          (v.name && v.name.toLowerCase().startsWith(q))
      );

    return match || null;
  };

  const result = {
    startVertex: null,
    endVertex: null,
  };

  if (startQuery) {
    result.startVertex = findVertex(startQuery);
  }

  if (endQuery) {
    result.endVertex = findVertex(endQuery);
  }

  return result;
}
