import { gql } from "@apollo/client";

export const TOGGLE_GAME_FOLLOW = gql`
  mutation ToggleGameFollow($gameId: ID!) {
    toggleGameFollow(gameId: $gameId)
  }
`;

export const TOGGLE_EVENT_FOLLOW = gql`
  mutation ToggleEventFollow($eventId: ID!) {
    toggleEventFollow(eventId: $eventId)
  }
`;

export const IS_FOLLOWING_GAME = gql`
  query IsFollowingGame($gameId: ID!) {
    isFollowingGame(gameId: $gameId)
  }
`;

export const IS_FOLLOWING_EVENT = gql`
  query IsFollowingEvent($eventId: ID!) {
    isFollowingEvent(eventId: $eventId)
  }
`;
