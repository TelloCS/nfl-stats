import { useQuery } from "@tanstack/react-query";
import { useEtlVersion } from "./useEtlVersion";

/**
 * A wrapper hook that automatically injects the global ETL version
 * into any query options factory.
 */
export function useVersionedQuery(queryOptionsFactory, ...factoryArgs) {
  const { data: etlData, isLoading: isVersionLoading } = useEtlVersion();

  const currentVersion = etlData?.version;
  const options = queryOptionsFactory(...factoryArgs, currentVersion);
  return useQuery({
    ...options,
    enabled: !isVersionLoading && currentVersion !== undefined && options.enabled !== false,
  });
}