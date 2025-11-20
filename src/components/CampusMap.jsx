import { useMemo } from 'react';
import mapImg from '../assets/map.png';
import { createCampusGraph } from '../helper/campusGraph.js';
import VertexNode from './VertexNode.jsx';
import EdgeLayer from './EdgeLayer.jsx';

function CampusMap() {
  const graph = useMemo(() => createCampusGraph(), []);

  return (
    <div className="flex justify-center items-center bg-slate-900">
      <div className="relative inline-block">
        {/* Background map */}
        <img
          src={mapImg}
          alt="WSU Pullman Campus Map"
          className="block max-w-full h-auto"
        />

        {/* Graph overlays */}
        <div className="absolute inset-0">
          {/* Edges first so they render under the nodes */}
          <EdgeLayer graph={graph} />

          {/* Vertices on top */}
          {Object.values(graph.vertices).map((vertex) => (
            <VertexNode key={vertex.id} vertex={vertex} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
