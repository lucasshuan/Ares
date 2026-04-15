import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from "@apollo/client";

import { getClient } from "@/lib/apollo/apollo-client";

type SafeServerQueryOptions<
  TData,
  TVariables extends OperationVariables = OperationVariables,
> = {
  query: DocumentNode | TypedDocumentNode<TData, TVariables>;
  variables?: TVariables;
};

export async function safeServerQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>({ query, variables }: SafeServerQueryOptions<TData, TVariables>) {
  try {
    const { data } = (await getClient().query({
      query: query as DocumentNode,
      variables,
    })) as { data: TData | undefined };

    return data ?? null;
  } catch {
    return null;
  }
}
