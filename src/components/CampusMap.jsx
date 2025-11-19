import mapImg from '../assets/map.png';

function CampusMap() {
  return (
    <div className="absolute inset-0 -z-10 bg-slate-900" aria-hidden="true">
      <img
        src={mapImg}
        alt="WSU Pullman parking map"
        className="h-full w-full object-contain md:object-cover"
      />
    </div>
  );
}

export default CampusMap;
