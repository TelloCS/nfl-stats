import { useMemo } from 'react';
import { useVersionedInfiniteQuery } from '../../hooks/useVersionedInfiniteQuery';
import createPlayerFantasyRankingsQueryOptions from "../../queryOptions/createPlayerFantasyRankingsQueryOptions";

export const useFantasyRankings = (filters) => {
  const query = useVersionedInfiniteQuery(
    createPlayerFantasyRankingsQueryOptions,
    filters.position,
    filters.team,
    filters.season_year,
    filters.season_type,
    filters.scoring_format
  );

  const { data } = query;

  const flatData = useMemo(() => {
    return data?.pages?.flatMap(page => {
      return Array.isArray(page) ? page : (page?.results || []);
    }) || [];
  }, [data]);

  const stats = useMemo(() => {
    if (!data?.pages?.length) return { totalCount: 0, totalPages: 0, loadedCount: 0 };

    const firstPage = data.pages[0];

    if (Array.isArray(firstPage)) {
      return {
        totalCount: firstPage.length,
        totalPages: 1,
        loadedCount: firstPage.length
      };
    }

    const totalCount = firstPage.count || 0;

    const pageSize = firstPage.results?.length > 0 ? firstPage.results.length : 50;

    return {
      totalCount,
      totalPages: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      loadedCount: flatData.length
    };
  }, [data, flatData.length]);

  return {
    ...query,
    flatData,
    stats
  };
}

export const formatOrdinal = (num) => {
  if (num === undefined || num === null || num === "") return "--";
  const pr = new Intl.PluralRules("en-US", { type: "ordinal" });
  const rule = pr.select(num);
  const suffix = rule === "one" ? "st" : rule === "two" ? "nd" : rule === "few" ? "rd" : "th";
  return `${num}${suffix}`;
};

export const SCORING_FORMATS = {
  ppr_points: { 
    label: 'PPR', 
    posRankLabel: 'Pos RK', 
    points: 'PPR Pts', 
    value: 'ppr_points', 
    rankKey: 'rank_ppr', 
    posRankKey: 'pos_rank_ppr' 
  },
  half_ppr_points: { 
    label: 'Half PPR', 
    posRankLabel: 'Pos RK', 
    points: 'Half PPR Pts',
    value: 'half_ppr_points', 
    rankKey: 'rank_half_ppr', 
    posRankKey: 'pos_rank_half_ppr' 
  },
  non_ppr_points: { 
    label: 'Non-PPR', 
    posRankLabel: 'Pos RK', 
    points: 'Std Pts', 
    value: 'non_ppr_points', 
    rankKey: 'rank_non_ppr', 
    posRankKey: 'pos_rank_non_ppr' 
  },
  yahoo_points: { 
    label: 'Yahoo', 
    posRankLabel: 'Pos RK', 
    points: 'Yahoo Pts', 
    value: 'yahoo_points', 
    rankKey: 'rank_yahoo', 
    posRankKey: 'pos_rank_yahoo' 
  },
  draftkings_points: { 
    label: 'DraftKings', 
    posRankLabel: 'Pos RK', 
    points: 'DK Pts', 
    value: 'draftkings_points', 
    rankKey: 'rank_draftkings', 
    posRankKey: 'pos_rank_draftkings' 
  },
  fanduel_points: { 
    label: 'FanDuel', 
    posRankLabel: 'Pos RK', 
    points: 'FD Pts', 
    value: 'fanduel_points', 
    rankKey: 'rank_fanduel', 
    posRankKey: 'pos_rank_fanduel' 
  },
};

export const Positions = {
  position: [
    { label: "All Players", value: "" },
    { label: "QB", value: "QB" },
    { label: "RB", value: "RB" },
    { label: "WR", value: "WR" },
    { label: "TE", value: "TE" },
  ]
}

export const TeamAbbreviations = {
  team: [
    { label: "All Teams", value: "" },
    { label: 'ARI', value: 'ARI' },
    { label: 'ATL', value: 'ATL' },
    { label: 'BAL', value: 'BAL' },
    { label: 'BUF', value: 'BUF' },
    { label: 'CAR', value: 'CAR' },
    { label: 'CHI', value: 'CHI' },
    { label: 'CIN', value: 'CIN' },
    { label: 'CLE', value: 'CLE' },
    { label: 'DAL', value: 'DAL' },
    { label: 'DEN', value: 'DEN' },
    { label: 'DET', value: 'DET' },
    { label: 'GB', value: 'GB' },
    { label: 'HOU', value: 'HOU' },
    { label: 'IND', value: 'IND' },
    { label: 'JAX', value: 'JAX' },
    { label: 'KC', value: 'KC' },
    { label: 'LAC', value: 'LAC' },
    { label: 'LAR', value: 'LAR' },
    { label: 'LV', value: 'LV' },
    { label: 'MIA', value: 'MIA' },
    { label: 'MIN', value: 'MIN' },
    { label: 'NE', value: 'NE' },
    { label: 'NO', value: 'NO' },
    { label: 'NYG', value: 'NYG' },
    { label: 'NYJ', value: 'NYJ' },
    { label: 'PHI', value: 'PHI' },
    { label: 'PIT', value: 'PIT' },
    { label: 'SEA', value: 'SEA' },
    { label: 'SF', value: 'SF' },
    { label: 'TB', value: 'TB' },
    { label: 'TEN', value: 'TEN' },
    { label: 'WSH', value: 'WSH' },
  ]
}