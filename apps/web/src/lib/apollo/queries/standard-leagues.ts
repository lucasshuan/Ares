import { gql } from "@apollo/client";

export const GET_STANDARD_LEAGUES = gql`
  query GetStandardLeagues($pagination: PaginationInput) {
    standardLeagues(pagination: $pagination) {
      nodes {
        id
        event {
          name
          slug
          description
          type
          isApproved
          createdAt
          game {
            id
            name
            slug
            thumbnailImageUrl
          }
        }
        entries {
          id
          points
          wins
          draws
          losses
          position
          player {
            id
            user {
              id
              name
              username
              country
            }
          }
        }
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_STANDARD_LEAGUE = gql`
  query GetStandardLeague($gameSlug: String!, $leagueSlug: String!) {
    standardLeague(gameSlug: $gameSlug, slug: $leagueSlug) {
      id
      allowDraw
      pointsPerWin
      pointsPerDraw
      pointsPerLoss
      allowedFormats
      event {
        name
        slug
        description
        type
        participationMode
        isApproved
        createdAt
        updatedAt
        game {
          id
          name
          slug
          thumbnailImageUrl
          status
        }
      }
      entries {
        id
        leagueId
        playerId
        points
        wins
        draws
        losses
        position
        player {
          id
          userId
          user {
            id
            name
            username
            imageUrl
            country
          }
        }
      }
    }
  }
`;
