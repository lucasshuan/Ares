import { gql } from "@apollo/client";

export const GET_LEAGUE = gql`
  query GetLeague($gameSlug: String!, $leagueSlug: String!) {
    league(gameSlug: $gameSlug, slug: $leagueSlug) {
      id
      name
      slug
      description
      initialElo
      ratingSystem
      type
      createdAt
      game {
        id
        name
        slug
        thumbnailImageUrl
        status
      }
      entries {
        id
        currentElo
        position
        player {
          id
          userId
          user {
            id
            name
            username
            image
            country
          }
        }
      }
    }
  }
`;

export const UPDATE_LEAGUE = gql`
  mutation UpdateLeague($id: ID!, $input: UpdateLeagueInput!) {
    updateLeague(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;
