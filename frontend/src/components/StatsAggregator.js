export const STAT_TYPES = {
  VOLUME: [
    'completions', 'pass_attempts', 'pass_yards', 'pass_touchdowns',
    'interceptions', 'sacks', 'fumbles', 'fumbles_lost',
    'rush_attempts', 'rush_yards', 'rush_touchdowns',
    'receptions', 'rec_targets', 'rec_yards', 'rec_touchdowns'
  ],
  DERIVED: [
    'completion_pct', 'yards_per_pass_attempt', 'pass_rating', 'adjusted_qbr',
    'yards_per_rush_attempt', 'yards_per_reception'
  ],
  MAX: [
    'long_rushing', 'long_reception'
  ]
};

export const calculateWeeklyStats = (data, position) => {
  const safeDiv = (num, den) => (den > 0 ? Number((num / den).toFixed(2)) : 0);

  STAT_TYPES.MAX.forEach(key => {
    if (data.contributors?.length > 0) {
      const values = data.contributors.map(p => p[key] || 0);
      data[key] = Math.max(...values, 0);
    } else {
      data[key] = 0;
    }
  });

  if (position === 'QB') {
    const activeContributors = data.contributors.filter(p => (p.pass_attempts || 0) > 0);

    if (activeContributors.length > 0) {
      const totalQBR = activeContributors.reduce((sum, p) => sum + (p.adjusted_qbr || 0), 0);
      data.adjusted_qbr = safeDiv(totalQBR, activeContributors.length);
    } else {
      data.adjusted_qbr = 0;
    }

    if (data.pass_attempts > 0) {
      data.completion_pct = safeDiv(data.completions * 100, data.pass_attempts);
      data.yards_per_pass_attempt = safeDiv(data.pass_yards, data.pass_attempts);
    }
  }

  if (data.rush_attempts) {
    data.yards_per_rush_attempt = safeDiv(data.rush_yards, data.rush_attempts);
  }

  if (data.receptions) {
    data.yards_per_reception = safeDiv(data.rec_yards, data.receptions);
  }

  return data;
};