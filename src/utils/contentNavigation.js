// Content IDs remain stable when another document is deleted.
export const getContentNeighbors = (entries, id) => {
  const index = entries.findIndex(entry => Number(entry.id) === Number(id));
  return {
    previous: index > 0 ? entries[index - 1] : null,
    next: index >= 0 && index + 1 < entries.length ? entries[index + 1] : null,
  };
};
