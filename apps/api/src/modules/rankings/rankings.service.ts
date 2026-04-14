import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { rankings } from '@ares/db';
import { desc } from 'drizzle-orm';

@Injectable()
export class RankingsService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll() {
    return this.databaseProvider.db.query.rankings.findMany({
      orderBy: [desc(rankings.createdAt)],
      with: {
        game: true,
      },
    });
  }

  async findByGameAndSlug(gameId: string, slug: string) {
    return this.databaseProvider.db.query.rankings.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.gameId, gameId), eq(table.slug, slug)),
      with: {
        game: true,
      },
    });
  }
}
