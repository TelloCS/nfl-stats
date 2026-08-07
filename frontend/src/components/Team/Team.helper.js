import { useMemo } from "react";

export const usePlayersByPosition = (players = []) => {
  return useMemo(() => {
    if (!Array.isArray(players) || players.length === 0) {
      return {};
    }

    if (typeof Object.groupBy === 'function') {
      return Object.groupBy(players, (player) => player.position || 'Unknown');
    }

    return players.reduce((acc, player) => {
      const pos = player.position || 'Unknown';
      if (!acc[pos]) {
        acc[pos] = [];
      }
      acc[pos].push(player);
      return acc;
    }, {});
  }, [players]);
};

export const generateRankOptions = (dataObj) => {
  if (!dataObj || typeof dataObj !== 'object') return [];

  return Object.keys(dataObj)
    .filter((key) => key.endsWith('_rank'))
    .map((key) => {
      const formattedLabel = key
        .replace(/_rank$/, '')
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return {
        value: key,
        label: formattedLabel
      };
    });
};