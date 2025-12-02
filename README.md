# WSU Campus Graph GPS

WSU Campus Graph GPS is an interactive campus map for the WSU Pullman campus.  
It lets you pick two locations on the map, runs a shortest-path search between them, and visualizes how the algorithm explores the graph before showing the final route and total distance.

## Demo Video

▶️ [WSU Campus GPS | Graph Theory Final Project Demo (Dijkstra’s Algorithm)](https://youtu.be/B2fOKqGwaTA)

---

## What this project is

This app is a small, focused graph-theory project wrapped in a modern web UI:

- **Frontend:** Vite + React with Tailwind utility classes for layout and styling.
- **Map:** An image of the WSU Pullman campus, treated as a “world space” with fixed width/height in map coordinates.
- **Graph:** Campus paths are modeled as a weighted graph: vertices are locations on campus; edges are walkable paths with a numeric distance.

The top navbar holds the “From / To / Distance” UI, while the main content is the interactive map with zoom, pan, and graph overlays.

---

## Features

### Route search

- **From / To inputs:** Type part of a building name or vertex id into the “From” and “To” fields. Suggestions appear live as you type.
- **Suggestion ranking:** Suggestions are ranked by exact match, prefix match, then substring match on both id and name.  
- **Commit on Enter / click:** Hitting Enter, or choosing a suggestion, commits that vertex as the start or end of the route. The app then runs pathfinding for any committed pair.  
- **Distance readout:** Once a valid route is found, the total distance (sum of edge weights on the path) is shown in the navbar next to “Distance.”

You can also skip typing entirely and just click directly on nodes in the map to choose start (green) and end (red) vertices.

### Map interaction

- **Pan:** Click-and-drag (desktop) or one-finger drag (touch) to move around the map. Panning is clamped so you can’t drag outside the world bounds.
- **Zoom:** Use the +/– controls or the mouse wheel (without Ctrl) to zoom in and out, between defined min/max zoom levels.  
- **Touch pinch:** On mobile, two-finger pinch gestures change the zoom level.

The camera system tracks a logical center and zoom value and converts that into a translate + scale transform on the map image, so overlays (nodes and edges) can be drawn consistently in screen space based on world coordinates.

### Graph visualization

- **Vertices:** Each vertex knows its id, display name, and position `(x, y)` in world coordinates.
- **Degree labels:** Every vertex renders a small badge next to it showing its **degree** (how many edges are incident to that vertex).
- **Edges:** Connect two vertex ids (`u`, `v`) and have a numeric `weight` (distance). All edges are treated as undirected.  
- **Edge weight on hover:** When you hover an edge, a small pill-shaped label appears at the midpoint showing that edge’s **weight**.
- **Hover highlights:** Hovering a vertex highlights all incident edges and ties into the degree display, making local structure easy to see.
- **Path overlay:** When a route is found, vertices and edges along the shortest path are highlighted on top of the map.

---

## Controls (quick reference)

**Navbar**

- **From:**  
  - Type building or vertex name.  
  - Use arrow keys + Enter or click to choose a suggestion.  
  - Press Enter to commit and auto-focus the “To” field.
- **To:**  
  - Same behavior as “From,” but commits the destination.  
- **Distance:**  
  - Read-only display of the current shortest path distance (sum of edge weights).

**Map**

- **Click vertex (no route yet):** set start vertex.  
- **Click a different vertex:** set end vertex and compute route. 
- **Click any vertex when a full route exists:** restart the route selection from that vertex. 
- **Mouse drag / one-finger drag:** pan map. 
- **Mouse wheel (no Ctrl) / pinch:** zoom map in or out.  

---

## Graph theory under the hood

### Graph model

The campus is modeled as a weighted graph \( G = (V, E) \):

- Each **vertex** \( v ∈ V \) represents a campus location and stores:
  - a unique `id`
  - a human-readable `name`
  - a 2D position `(x, y)` in map coordinates.
- Each **edge** \( e ∈ E \) connects two vertices `u` and `v` and stores:
  - an `id`
  - the endpoints `u`, `v`
  - a non-negative `weight` representing distance. 

Internally, the graph keeps:

- a dictionary of vertices
- a dictionary of edges
- an adjacency list `adjacency[vertexId] -> [{ to, weight, edgeId }, …]` for efficient neighbor lookups and degree queries.

This structure lets the app quickly access neighbors, degrees, and incident edges, which is important for both pathfinding and hover highlights.

### Shortest paths with Dijkstra

When both a start and end vertex are selected, the app runs **Dijkstra’s algorithm** on this weighted graph:

1. Initialize distances `dist[v]` with `Infinity` except `dist[start] = 0`.
2. Repeatedly pick the unvisited vertex with the smallest tentative distance.
3. For each outgoing edge, relax the neighbor’s distance if going through the current vertex is cheaper.
4. Continue until all reachable vertices are processed or the destination is finalized.

The implementation returns:

- `dist`: map of vertex → final distance
- `pathVertices`: the reconstructed shortest path sequence
- `pathEdges`: the corresponding edge ids
- `visitedOrder` and `steps`: a detailed sequence of “visit-vertex” and “consider-edge” actions used to animate the traversal.

The hook stores the final path in a “pending” buffer, plays the traversal animation using the `steps`, and only after the animation completes does it reveal the final path overlay.  

Because all edge weights are non-negative distances, Dijkstra’s algorithm is guaranteed to find the true shortest path between the chosen start and end vertices.

---

## Future ideas

Some potential future extensions:

- Add depth to the map, creating Z-level weight.
- Add filters for accessible routes or stair-free paths.  
- Support multiple campuses or custom graphs.  

For now, this project is a clean, focused demo of how graph theory and pathfinding algorithms can drive a practical, interactive campus navigation tool.  

---

## Sources

### Campus basemap

The static campus basemap used in this project was exported from the public WSU Facilities Services GIS viewer:

- Washington State University Facilities Services – **Pullman Campus Map** (ArcGIS Online).  
  Original interactive map: <https://wsuadmin.maps.arcgis.com/apps/instant/basic/index.html?appid=502d2ab6786d42e39dc0996bac872759>

Map imagery and data remain the property of **Washington State University** and its mapping/data providers (via **Esri ArcGIS Online**).

This project is a personal, non-commercial, educational tool. It is not affiliated with or endorsed by Washington State University, Esri, or any of their partners. All trademarks and logos are the property of their respective owners.

