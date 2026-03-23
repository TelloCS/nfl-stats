import { useInfiniteQuery } from "@tanstack/react-query";
import { useEtlVersion } from "./useEtlVersion";

/**
 * A wrapper hook that automatically injects the global ETL version
 * into any query options factory.
 */
export function useVersionedInfiniteQuery(queryOptionsFactory, ...factoryArgs) {
  const { data: etlData } = useEtlVersion();
  const currentVersion = etlData?.version || 0;
  const options = queryOptionsFactory(...factoryArgs, currentVersion);
  return useInfiniteQuery(options);
}