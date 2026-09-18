import { useMemo } from "react";

export const usePlayersByPosition = (players = []) => {
  return useMemo(() => {
    if (!Array.isArray(players) || players.length === 0) {
      return {};
    }

    const getPosition = (item) =>
      item?.player?.position ?? item?.position ?? 'Unknown';

    if (typeof Object.groupBy === 'function') {
      return Object.groupBy(players, getPosition);
    }

    return players.reduce((acc, item) => {
      const pos = getPosition(item);

      (acc[pos] ??= []).push(item);
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
        .join(' ').toUpperCase()

      return {
        value: key,
        label: formattedLabel
      };
    });
};