import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from "@apollo/client";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

import { getClient } from "@/lib/apollo/apollo-client";
import { logger } from "@/lib/server/logger";
import { env } from "@/env";

type SafeServerQueryOptions<
  TData,
  TVariables extends OperationVariables = OperationVariables,
> = {
  query: DocumentNode | TypedDocumentNode<TData, TVariables>;
  variables?: TVariables;
  /** Pass a token explicitly to avoid reading cookies (required inside "use cache" scopes). */
  token?: string | null;
};

export async function safeServerQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>({ query, variables, token }: SafeServerQueryOptions<TData, TVariables>) {
  try {
    const client =
      token !== undefined
        ? new ApolloClient({
            cache: new InMemoryCache(),
            link: new HttpLink({
              uri: env.NEXT_PUBLIC_API_URL,
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
          })
        : getClient();

    const { data } = (await client.query({
      query: query as DocumentNode,
      variables,
    })) as { data: TData | undefined };

    return data ?? null;
  } catch (err) {
    logger.error({ err }, "[safeServerQuery] Query failed");
    return null;
  }
}
