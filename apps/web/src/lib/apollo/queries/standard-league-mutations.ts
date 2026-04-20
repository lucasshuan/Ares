import { gql } from "@apollo/client";

export const CREATE_STANDARD_LEAGUE = gql`
  mutation CreateStandardLeague(
    $event: CreateEventInput!
    $league: CreateStandardLeagueInput!
  ) {
    createStandardLeague(event: $event, league: $league) {
      id
      event {
        name
        slug
        participationMode
      }
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
  mutation UpdateStandardLeague(
    $id: ID!
    $event: UpdateEventInput
    $league: UpdateStandardLeagueInput
  ) {
    updateStandardLeague(id: $id, event: $event, league: $league) {
      id
      event {
        name
        slug
      }
    }
  }
`;
