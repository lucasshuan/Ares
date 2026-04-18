"use client";

import { HttpLink, ApolloLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { getSession, signOut } from "next-auth/react";
import { env } from "@/env";

function makeClient() {
  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_API_URL,
    fetchOptions: { cache: "no-store" },
  });

  const authLink = new SetContextLink(async ({ headers }) => {
    const session = await getSession();
    const token = session?.user?.accessToken;

    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const errorLink = onError(({ error }) => {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : undefined;

    const graphQLErrors =
      typeof error === "object" &&
      error !== null &&
      "errors" in error &&
      Array.isArray(error.errors)
        ? (error.errors as Array<{ extensions?: Record<string, unknown> }>)
        : [];

    // Network-level auth failure (REST or HTTP transport)
    if (statusCode === 401 || statusCode === 403) {
      void signOut({ callbackUrl: "/auth/signin" });
      return;
    }

    // GraphQL-level auth failure
    // NOTE: verify that NestJS maps UnauthorizedException to extensions.code === "UNAUTHENTICATED"
    // before relying on this branch. If the code is different, update the check below.
    if (
      graphQLErrors.some(
        (graphQLError) =>
          graphQLError.extensions?.["code"] === "UNAUTHENTICATED",
      )
    ) {
      void signOut({ callbackUrl: "/auth/signin" });
    }
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    devtools: {
      enabled: true,
    },
  });

  return client;
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
