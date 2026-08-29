import { type QueryKey, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { isTaggedError } from "better-result";

type UseResultQueryOptions<TResult, TQueryKey extends QueryKey = QueryKey> = Omit<
  UseQueryOptions<
    Exclude<TResult, Error>,
    Extract<TResult, Error>,
    Exclude<TResult, Error>,
    TQueryKey
  >,
  "queryFn"
> & {
  queryFn: () => Promise<TResult>;
};

// queryFnが値として返すエラーを、useQueryが要求するthrowベースの契約に変換する
export const useResultQuery = <TResult, TQueryKey extends QueryKey = QueryKey>({
  queryFn,
  ...options
}: UseResultQueryOptions<TResult, TQueryKey>) => {
  return useQuery<
    Exclude<TResult, Error>,
    Extract<TResult, Error>,
    Exclude<TResult, Error>,
    TQueryKey
  >({
    ...options,
    queryFn: async () => {
      const result = await queryFn();
      if (isTaggedError(result)) {
        throw result;
      }
      return result as Exclude<TResult, Error>;
    },
  });
};
