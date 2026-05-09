import { useInfiniteQuery } from "@tanstack/react-query";
import { useEtlVersion } from "./useEtlVersion";

/**
 * A wrapper hook that automatically injects the global ETL version
 * into any query options factory.
 */
export function useVersionedInfiniteQuery(queryOptionsFactory, ...factoryArgs) {
  const { data: etlData, isLoading: isVersionLoading } = useEtlVersion();

  const currentVersion = etlData?.version;
  const options = queryOptionsFactory(...factoryArgs, currentVersion);
  return useInfiniteQuery({
    ...options,
    enabled: !isVersionLoading && currentVersion !== undefined && options.enabled !== false,
  });
}