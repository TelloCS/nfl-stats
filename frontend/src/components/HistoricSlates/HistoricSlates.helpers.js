const SEASON_TYPE_LABELS = {
  2: "Regular Season",
  3: "Playoffs",
};

export function buildFilterConfig(apiResponse) {
  if (!apiResponse) return null;

  const season_year = [...(apiResponse.season_years ?? [])]
    .sort((a, b) => b - a)
    .map((year) => ({ label: String(year), value: year }));

  const season_type = [...(apiResponse.season_types ?? [])]
    .sort((a, b) => a - b)
    .map((type) => ({
      label: SEASON_TYPE_LABELS[type] ?? `Type ${type}`,
      value: type,
    }));

  const week = [...(apiResponse.weeks ?? [])]
    .sort((a, b) => b - a)
    .map((w) => ({ label: `Week ${w}`, value: w }));

  return {
    season_year,
    season_type,
    week,
  };
}

export const getTeamStatusClass = (teamScore, opponentScore) => {
  if (teamScore === null || opponentScore === null) {
    return "text-paper-300";
  }

  const score = Number(teamScore);
  const oppScore = Number(opponentScore);

  if (score > oppScore) {
    return "text-primary font-bold";
  }

  if (score < oppScore) {
    return "text-error-500 opacity-60";
  }

  return "text-status-aware font-semibold";
};