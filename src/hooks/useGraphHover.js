import { useState, useMemo, useCallback } from 'react';

/**
 * Graph hover/visualization hook.
 *
 * - Tracks hovered vertex (and placeholder for hovered edge).
 * - Uses graph.adjacency to derive:
 *   - highlightedEdgeIds: edges incident to hovered vertex
 *   - getDegree(v): degree of a vertex
 */
export function useGraphHover(graph) {
    const [hoveredVertexId, setHoveredVertexId] = useState(null);
    const [hoveredEdgeId, setHoveredEdgeId]     = useState(null);

    const highlightedEdgeIds = useMemo(() => {
        if (!graph || !hoveredVertexId || !graph.adjacency) return [];

        const neighbors = graph.adjacency[hoveredVertexId];
        if (!neighbors) return [];

        return neighbors.map((n) => n.edgeId);
    }, [graph, hoveredVertexId]);

    const getDegree = useCallback((vertexId) => {
        if (!graph || !graph.adjacency) return 0;

        const neighbors = graph.adjacency[vertexId];
        return neighbors ? neighbors.length : 0;
    }, [graph]);

    // For VertexNode hover -> highlight edges
    const handleVertexHoverChange = useCallback((vertexId, isHovering) => {
        if (isHovering) {
            setHoveredVertexId(vertexId);
        } else {
            // Only clear if still hovering *this* vertex
            setHoveredVertexId((current) =>
                current === vertexId ? null : current
            );
        }
    }, []);

    const handleEdgeHoverChange = useCallback((edgeId, isHovering) => {
        if (isHovering) {
            setHoveredEdgeId(edgeId);
        } else {
            setHoveredEdgeId((current) =>
                current === edgeId ? null : current
            );
        }
    }, []);

    return {
        hoveredVertexId,
        hoveredEdgeId,
        highlightedEdgeIds,
        getDegree,
        handleVertexHoverChange,
        handleEdgeHoverChange,
    };
}
