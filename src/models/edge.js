export function edge({ id, u, v, weight, directed = false }) {
  return {
    id,
    u,
    v,
    weight,
    directed
  };
}
