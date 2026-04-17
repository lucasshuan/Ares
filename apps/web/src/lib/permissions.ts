import { type Session } from "next-auth";

import { type PermissionKey } from "@ares/core";

export function hasPermission(
  session: Session | null,
  key: PermissionKey | PermissionKey[],
) {
  if (!session?.user) return false;
  if (session.user.isAdmin) return true;
  const keys = Array.isArray(key) ? key : [key];
  return keys.some((k) => session.user.permissions.includes(k));
}

export function canManageGames(session: Session | null) {
  return hasPermission(session, "manage_games");
}

export function canManagePlayers(session: Session | null) {
  return hasPermission(session, "manage_players");
}

export function canManageLeagues(session: Session | null) {
  return hasPermission(session, "manage_events");
}

export function canEditGame(
  session: Session | null,
  authorId: string | null | undefined,
) {
  if (!session?.user) return false;
  if (canManageGames(session)) return true;
  return !!authorId && session.user.id === authorId;
}
