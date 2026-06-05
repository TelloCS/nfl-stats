import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createTeamStatsRanksQueryOptions from "../queryOptions/createTeamStatsRanksQueryOptions";

export default function useTeamRanks() {
  return useVersionedQuery(createTeamStatsRanksQueryOptions);
}