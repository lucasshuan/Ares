import { gql } from "@apollo/client";

export const GET_ELO_LEAGUES = gql`
  query GetEloLeagues($pagination: PaginationInput) {
    eloLeagues(pagination: $pagination) {
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
          currentElo
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

export const GET_ELO_LEAGUE = gql`
  query GetEloLeague($gameSlug: String!, $leagueSlug: String!) {
    eloLeague(gameSlug: $gameSlug, slug: $leagueSlug) {
      id
      initialElo
      allowDraw
      kFactor
      scoreRelevance
      inactivityDecay
      inactivityThresholdHours
      inactivityDecayFloor
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
        currentElo
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
