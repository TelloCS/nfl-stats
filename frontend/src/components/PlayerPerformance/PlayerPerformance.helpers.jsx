export const EMPTY_STATS = [];

export const getSeasonOptions = (availableSeasons) => {
  if (!availableSeasons || !Array.isArray(availableSeasons)) return EMPTY_STATS;
  
  return availableSeasons.map((year) => ({
    label: String(year),
    value: String(year),
  }));
};

export const getAvailableStats = (position, positionStatMap) => {
  if (!position || !positionStatMap) return EMPTY_STATS;
  
  return positionStatMap[position] || EMPTY_STATS;
};

export const getCurrentStatDetails = (availableStats, activeStat) => {
  if (!availableStats || availableStats.length === 0) {
    return { currentStatKey: "", activeStatLabel: "" };
  }

  const currentStatObj = availableStats.find(s => s.key === activeStat) || availableStats[0];
  
  return {
    currentStatKey: currentStatObj?.key ?? "",
    activeStatLabel: currentStatObj?.label ?? "",
  };
};

export function removeStatByKey(stats, key) {
  return stats.filter(stat => stat.key !== key);
}