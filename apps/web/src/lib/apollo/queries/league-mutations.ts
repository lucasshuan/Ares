import { gql } from "@apollo/client";

export const CREATE_LEAGUE = gql`
  mutation CreateLeague($input: CreateEloLeagueInput!) {
    createLeague: createEloLeague(input: $input) {
      id
      name
      slug
    }
  }
`;

export const ADD_PLAYER_TO_LEAGUE = gql`
  mutation AddPlayerToLeague($leagueId: ID!, $playerId: ID!, $initialElo: Int) {
    addPlayerToLeague: addPlayerToEloLeague(
      leagueId: $leagueId
      playerId: $playerId
      initialElo: $initialElo
    ) {
      id
      currentElo
    }
  }
`;

export const REGISTER_SELF_TO_LEAGUE = gql`
  mutation RegisterSelfToLeague($leagueId: ID!) {
    registerSelfToLeague: registerSelfToEloLeague(leagueId: $leagueId) {
      id
    }
  }
`;

export const UPDATE_LEAGUE = gql`
  mutation UpdateLeague($id: ID!, $input: UpdateEloLeagueInput!) {
    updateLeague: updateEloLeague(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;
