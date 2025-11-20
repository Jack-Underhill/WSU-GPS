function vertex({ id, name, x, y, isTerminal = false }) {
  return {
    id,
    name,
    position: { x, y },
    isTerminal: Boolean(isTerminal)
  };
}