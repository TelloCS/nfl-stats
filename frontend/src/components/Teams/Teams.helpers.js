export function groupTeamsByConferenceAndDivision(teams) {
  if (!Array.isArray(teams)) return {};

  return teams.reduce((acc, team) => {
    const conference = team?.conference;
    const division = team?.division;

    if (!conference || !division) return acc;

    if (!acc[conference]) {
      acc[conference] = {};
    }

    if (!acc[conference][division]) {
      acc[conference][division] = [];
    }

    acc[conference][division].push(team);

    return acc;
  }, {});
}