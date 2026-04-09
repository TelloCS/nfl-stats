import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export function useEtlVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: () => apiFetch("/nfl/etl-version/"),
    refetchInterval: 60000, 
    staleTime: 0, 
    refetchOnWindowFocus: true,
  });
}