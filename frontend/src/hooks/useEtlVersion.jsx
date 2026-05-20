import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export function useEtlVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: () => apiFetch("/nfl/sync-status/"),
    staleTime: 0,
    refetchInterval: (data) => {
      if (data === undefined) {
        return 5000;
      }

      if (data?.in_season === false) {
        return false;
      }

      return 60000;
    },

    refetchOnWindowFocus: (query) => {
      const data = query.state.data;
      if (data === undefined) return true;
      return data?.in_season !== false;
    },
  });
}