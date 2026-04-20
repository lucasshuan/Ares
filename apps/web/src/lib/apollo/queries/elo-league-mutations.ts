import { gql } from "@apollo/client";

export const CREATE_ELO_LEAGUE = gql`
  mutation CreateEloLeague(
    $event: CreateEventInput!
    $league: CreateEloLeagueInput!
  ) {
    createEloLeague(event: $event, league: $league) {
      id
      event {
        name
        slug
        participationMode
      }
    }
  }
`;

export const ADD_PLAYER_TO_ELO_LEAGUE = gql`
  mutation AddPlayerToEloLeague(
    $leagueId: ID!
    $playerId: ID!
    $initialElo: Int
  ) {
    addPlayerToEloLeague(
      leagueId: $leagueId
      playerId: $playerId
      initialElo: $initialElo
    ) {
      id
      currentElo
    }
  }
`;

export const REGISTER_SELF_TO_ELO_LEAGUE = gql`
  mutation RegisterSelfToEloLeague($leagueId: ID!) {
    registerSelfToEloLeague(leagueId: $leagueId) {
      id
    }
  }
`;

export const UPDATE_ELO_LEAGUE = gql`
  mutation UpdateEloLeague(
    $id: ID!
    $event: UpdateEventInput
    $league: UpdateEloLeagueInput
  ) {
    updateEloLeague(id: $id, event: $event, league: $league) {
      id
      event {
        name
        slug
      }
    }
  }
`;
