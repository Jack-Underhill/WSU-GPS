// Shared normalizer
const normalize = (q) => (q || "").trim().toLowerCase();

/**
 * Suggest up to `maxResults` vertices for a given query.
 *
 * "Dumb" but ranked:
 *  - exact match on id or name (best)
 *  - startsWith on id or name
 *  - substring match on id or name
 *
 * Returns an array of vertex objects, sorted best → worst.
 */
export function suggestVertices(graph, rawQuery, maxResults = 4) {
  const vertices = Object.values(graph.vertices ?? {});
  const q = normalize(rawQuery);

  if (!q) return [];

  const scored = [];

  for (const v of vertices) {
    const id = (v.id || "").toLowerCase();
    const name = (v.name || "").toLowerCase();

    let score = Infinity;

    // 0 = exact match
    if (id === q || name === q) {
      score = 0;
    }
    // 1 = starts with
    else if (id.startsWith(q) || name.startsWith(q)) {
      score = 1;
    }
    // 2 = substring match
    else if (id.includes(q) || name.includes(q)) {
      score = 2;
    }

    if (score < Infinity) {
      scored.push({ vertex: v, score });
    }
  }

  // Sort by score, then by name/id for stable ordering
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;

    const nameA = (a.vertex.name || a.vertex.id || "").toLowerCase();
    const nameB = (b.vertex.name || b.vertex.id || "").toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  return scored.slice(0, maxResults).map((entry) => entry.vertex);
}

/**
 * Commit-style search:
 * - Uses the same ranking as `suggestVertices`, but only returns
 *   the single best match for each query.
 *
 * Returns:
 *   { startVertex: vertex|null, endVertex: vertex|null }
 */
export function searchVertices(graph, { startQuery, endQuery } = {}) {
  const findBest = (query) => {
    const suggestions = suggestVertices(graph, query, 1);
    return suggestions[0] || null;
  };

  const result = {
    startVertex: null,
    endVertex: null,
  };

  if (startQuery) {
    result.startVertex = findBest(startQuery);
  }

  if (endQuery) {
    result.endVertex = findBest(endQuery);
  }

  return result;
}
