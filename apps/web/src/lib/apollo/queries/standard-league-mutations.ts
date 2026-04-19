import { gql } from "@apollo/client";

export const CREATE_STANDARD_LEAGUE = gql`
  mutation CreateStandardLeague($input: CreateStandardLeagueInput!) {
    createStandardLeague(input: $input) {
      id
      name
      slug
    }
  }
`;

export const ADD_PLAYER_TO_STANDARD_LEAGUE = gql`
  mutation AddPlayerToStandardLeague($leagueId: ID!, $playerId: ID!) {
    addPlayerToStandardLeague(leagueId: $leagueId, playerId: $playerId) {
      id
      points
    }
  }
`;

export const REGISTER_SELF_TO_STANDARD_LEAGUE = gql`
  mutation RegisterSelfToStandardLeague($leagueId: ID!) {
    registerSelfToStandardLeague(leagueId: $leagueId) {
      id
    }
  }
`;

export const UPDATE_STANDARD_LEAGUE = gql`
  mutation UpdateStandardLeague($id: ID!, $input: UpdateStandardLeagueInput!) {
    updateStandardLeague(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;
