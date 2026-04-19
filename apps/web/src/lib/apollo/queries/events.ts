import { gql } from "@apollo/client";

export const GET_EVENT_META = gql`
  query GetEventMeta($gameSlug: String!, $slug: String!) {
    eventMeta(gameSlug: $gameSlug, slug: $slug) {
      id
      type
    }
  }
`;
