export default function VertexNode({ vertex }) {
  const { id, name, position } = vertex;
  const { x, y } = position;

  return (
    <div
      className={`
        absolute
        -translate-x-1/2 -translate-y-1/2
        w-4 h-4 z-10 rounded-full
        bg-blue-500
        cursor-pointer
        transition
        hover:bg-yellow-400
        hover:scale-125
        hover:ring-2
        hover:ring-yellow-300
      `}
      style={{
        left: x,
        top: y
      }}
      title={name}
      onClick={() => {
        console.log('Vertex clicked:', { id, name, position });
      }}
    />
  );
}
