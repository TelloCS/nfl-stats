export const cleanFilters = (filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
}