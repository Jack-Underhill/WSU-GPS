import { vertex } from './vertex.js';
import { edge }   from './edge.js';

export function createGraph() {
    const vertices  = {};  // V
    const edges     = {};  // E
    const adjacency = {};  // adjacency list: vertexId -> neighbors[]

    function addVertex(props) {
        const v = vertex(props);
        vertices[v.id] = v;

        if (!adjacency[v.id]) {
            adjacency[v.id] = [];
        }

        return v;
    }

    function addEdge(props) {
        const e = edge(props);
        const { id, u, v, weight, directed } = e;

        if (!vertices[u] || !vertices[v]) {
            throw new Error(`Edge ${id} refers to missing vertex: ${u} or ${v}`);
        }

        edges[id] = e;

        // u -> v
        adjacency[u] = adjacency[u] || [];
        adjacency[u].push({ to: v, weight, edgeId: id });

        // if undirected, also v -> u
        if (!directed) {
            adjacency[v] = adjacency[v] || [];
            adjacency[v].push({ to: u, weight, edgeId: id });
        }

        return e;
    }

    function getVertex(id) {
        return vertices[id] || null;
    }

    function getEdge(id) {
        return edges[id] || null;
    }

    function getNeighbors(id) {
        return adjacency[id] || [];
    }

    return {
        vertices,
        edges,
        adjacency,
        addVertex,
        addEdge,
        getVertex,
        getEdge,
        getNeighbors
    };
}
