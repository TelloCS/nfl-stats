import { useQuery, UseQueryOptions, UseQueryResult, QueryKey } from "@tanstack/react-query";
import { useEtlVersion } from "./useEtlVersion";

/**
 * A wrapper hook that automatically injects the global ETL version
 * into any query options factory.
 */
export function useVersionedQuery<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
  TArgs extends any[]
>(
  queryOptionsFactory: (...args: [...TArgs, number]) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ...factoryArgs: TArgs
): UseQueryResult<TData, TError> {

  const { data: etlData, isLoading: isVersionLoading } = useEtlVersion();

  const currentVersion = etlData?.version;

  const options = queryOptionsFactory(...factoryArgs, currentVersion as number);

  return useQuery({
    ...options,
    enabled:
      !isVersionLoading &&
      currentVersion !== undefined &&
      options.enabled !== false,
  });
}