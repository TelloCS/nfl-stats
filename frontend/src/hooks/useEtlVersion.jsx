import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export function useEtlVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: () => apiFetch("/nfl/sync-status/"),
    refetchInterval: (query) => {
      const data = query.state?.data;
    
      if (data && data.in_season === false) {
        return false;
      }
      
      return 60000;
    },
    staleTime: 0, 
    refetchOnWindowFocus: true,
  });
}