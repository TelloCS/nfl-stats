import { useVersionedQuery } from "../hooks/useVersionedQuery";
import createUpcomingGamesQueryOptions from "../queryOptions/createUpcomingGamesQueryOptions";

export default function useUpcomingGames() {
  return useVersionedQuery(createUpcomingGamesQueryOptions);
}