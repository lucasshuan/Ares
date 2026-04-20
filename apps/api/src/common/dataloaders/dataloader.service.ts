import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DatabaseProvider } from '../../database/database.provider';
import { User } from '../../modules/auth/user.model';
import { Game } from '../../modules/games/game.model';
import { EloLeague } from '../../modules/elo-leagues/elo-league.model';
import { StandardLeague } from '../../modules/standard-leagues/standard-league.model';
import { EloLeagueEntry } from '../../modules/elo-leagues/elo-league-entry.model';
import { StandardLeagueEntry } from '../../modules/standard-leagues/standard-league-entry.model';

type PrismaLeagueWithEvent = {
  eventId: string;
  event: {
    gameId: string;
    id: string;
    name: string;
    slug: string;
    type: string;
    participationMode: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    approvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

function mapLeagueEvent<T extends PrismaLeagueWithEvent>(league: T) {
  return {
    ...league,
    id: league.event.id,
    event: {
      id: league.event.id,
      gameId: league.event.gameId,
      type: league.event.type,
      participationMode: league.event.participationMode,
      name: league.event.name,
      slug: league.event.slug,
      description: league.event.description,
      isApproved: !!league.event.approvedAt,
      startDate: league.event.startDate,
      endDate: league.event.endDate,
      createdAt: league.event.createdAt,
      updatedAt: league.event.updatedAt,
    },
  };
}

@Injectable({ scope: Scope.REQUEST })
export class DataLoaderService {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  public readonly userLoader = new DataLoader<string, User | null>(
    async (ids: readonly string[]) => {
      const users = await this.databaseProvider.user.findMany({
        where: { id: { in: [...ids] } },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      return ids.map(
        (id) => userMap.get(id) || null,
      ) as unknown as (User | null)[];
    },
  );

  public readonly gameLoader = new DataLoader<string, Game | null>(
    async (ids: readonly string[]) => {
      const games = await this.databaseProvider.game.findMany({
        where: { id: { in: [...ids] } },
      });
      const gameMap = new Map(games.map((g) => [g.id, g]));
      return ids.map(
        (id) => gameMap.get(id) || null,
      ) as unknown as (Game | null)[];
    },
  );

  public readonly eloLeaguesByGameIdLoader = new DataLoader<
    string,
    EloLeague[]
  >(async (gameIds: readonly string[]) => {
    const leagues = await this.databaseProvider.eloLeague.findMany({
      where: { event: { gameId: { in: [...gameIds] } } },
      include: { event: true },
      orderBy: { event: { createdAt: 'desc' } },
    });

    const byGameId = new Map<string, EloLeague[]>(
      gameIds.map((id) => [id, []]),
    );
    for (const league of leagues) {
      const mapped = mapLeagueEvent(league) as unknown as EloLeague;
      byGameId.get(mapped.event.gameId)?.push(mapped);
    }
    return gameIds.map((id) => byGameId.get(id) ?? []);
  });

  public readonly standardLeaguesByGameIdLoader = new DataLoader<
    string,
    StandardLeague[]
  >(async (gameIds: readonly string[]) => {
    const leagues = await this.databaseProvider.standardLeague.findMany({
      where: { event: { gameId: { in: [...gameIds] } } },
      include: { event: true },
      orderBy: { event: { createdAt: 'desc' } },
    });

    const byGameId = new Map<string, StandardLeague[]>(
      gameIds.map((id) => [id, []]),
    );
    for (const league of leagues) {
      const mapped = mapLeagueEvent(league) as unknown as StandardLeague;
      byGameId.get(mapped.event.gameId)?.push(mapped);
    }
    return gameIds.map((id) => byGameId.get(id) ?? []);
  });

  public readonly eloLeagueEntriesLoader = new DataLoader<
    string,
    EloLeagueEntry[]
  >(async (leagueIds: readonly string[]) => {
    const entries = await this.databaseProvider.eloLeagueEntry.findMany({
      where: { leagueId: { in: [...leagueIds] } },
      include: { player: { include: { user: true } } },
      orderBy: { currentElo: 'desc' },
    });

    const byLeagueId = new Map<string, EloLeagueEntry[]>(
      leagueIds.map((id) => [id, []]),
    );
    for (const entry of entries) {
      byLeagueId.get(entry.leagueId)?.push(entry as unknown as EloLeagueEntry);
    }
    return leagueIds.map((id) => byLeagueId.get(id) ?? []);
  });

  public readonly standardLeagueEntriesLoader = new DataLoader<
    string,
    StandardLeagueEntry[]
  >(async (leagueIds: readonly string[]) => {
    const entries = await this.databaseProvider.standardLeagueEntry.findMany({
      where: { leagueId: { in: [...leagueIds] } },
      include: { player: { include: { user: true } } },
      orderBy: [{ points: 'desc' }, { wins: 'desc' }],
    });

    const byLeagueId = new Map<string, StandardLeagueEntry[]>(
      leagueIds.map((id) => [id, []]),
    );
    for (const entry of entries) {
      byLeagueId
        .get(entry.leagueId)
        ?.push(entry as unknown as StandardLeagueEntry);
    }
    return leagueIds.map((id) => byLeagueId.get(id) ?? []);
  });
}
