import { gql } from "@apollo/client";

export const GET_LEAGUES = gql`
  query GetLeagues($pagination: PaginationInput) {
    leagues: eloLeagues(pagination: $pagination) {
      nodes {
        id
        name
        slug
        type
        game {
          id
          name
          slug
          thumbnailImageUrl
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

export const GET_LEAGUE = gql`
  query GetLeague($gameSlug: String!, $leagueSlug: String!) {
    league: eloLeague(gameSlug: $gameSlug, slug: $leagueSlug) {
      id
      name
      slug
      description
      initialElo
      type
      allowDraw
      kFactor
      scoreRelevance
      inactivityDecay
      inactivityThresholdHours
      inactivityDecayFloor
      gameId
      isApproved
      allowedFormats
      createdAt
      updatedAt
      game {
        id
        name
        slug
        thumbnailImageUrl
        status
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
