import { gql } from "@apollo/client";

export const GET_GAMES = gql`
  query GetGames($pagination: PaginationInput, $search: String) {
    games(pagination: $pagination, search: $search) {
      nodes {
        id
        name
        slug
        description
        thumbnailImageUrl
        backgroundImageUrl
        status
        _count {
          leagues
          players
        }
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_GAME = gql`
  query GetGame($slug: String!) {
    game(slug: $slug) {
      id
      name
      slug
      description
      thumbnailImageUrl
      backgroundImageUrl
      steamUrl
      websiteUrl
      status
      authorId
      createdAt
      updatedAt
      author {
        id
        name
        username
        imageUrl
      }
      eloLeagues {
        id
        name
        slug
        description
        initialElo
        isApproved
        startDate
        endDate
        createdAt
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
      standardLeagues {
        id
        name
        slug
        description
        pointsPerWin
        pointsPerDraw
        pointsPerLoss
        isApproved
        startDate
        endDate
        createdAt
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
      _count {
        leagues
        players
      }
    }
  }
`;
export const GET_GAME_ACTIONS = gql`
  query GetGameActions($slug: String!) {
    game(slug: $slug) {
      id
      slug
      authorId
      eloLeagues {
        id
        slug
      }
      standardLeagues {
        id
        slug
      }
    }
  }
`;

export const GET_GAME_LAYOUT = gql`
  query GetGameLayout($slug: String!) {
    game(slug: $slug) {
      id
      backgroundImageUrl
    }
  }
`;

export const GET_GAMES_SIMPLE = gql`
  query GetGamesSimple($pagination: PaginationInput, $search: String) {
    games(pagination: $pagination, search: $search) {
      nodes {
        id
        name
        slug
        description
        thumbnailImageUrl
      }
      totalCount
      hasNextPage
    }
  }
`;
