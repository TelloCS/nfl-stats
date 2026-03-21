import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/apiFetch";

export function useEtlVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: () => apiFetch("/api/etl-version/"),
    refetchInterval: 60000, 
    staleTime: 0, 
  });
}