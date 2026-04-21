import { gql } from "@apollo/client";

export const GET_LEAGUES = gql`
  query GetLeagues($gameId: String!, $pagination: PaginationInput) {
    leagues(gameId: $gameId, pagination: $pagination) {
      nodes {
        eventId
        classificationSystem
        config
        allowDraw
        allowedFormats
        event {
          id
          name
          slug
          type
          isApproved
          startDate
          endDate
          game {
            id
            name
            slug
            thumbnailImageUrl
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
    league(gameSlug: $gameSlug, slug: $leagueSlug) {
      eventId
      classificationSystem
      config
      allowDraw
      allowedFormats
      customFieldSchema
      createdAt
      updatedAt
      event {
        id
        name
        slug
        description
        about
        type
        isApproved
        startDate
        endDate
        registrationStartDate
        registrationEndDate
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
    }
  }
`;

