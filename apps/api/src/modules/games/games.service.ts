import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { games } from '@ares/db';
import { desc, eq } from 'drizzle-orm';

@Injectable()
export class GamesService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll() {
    return this.databaseProvider.db.query.games.findMany({
      orderBy: [desc(games.createdAt)],
    });
  }

  async findBySlug(slug: string) {
    return this.databaseProvider.db.query.games.findFirst({
      where: eq(games.slug, slug),
    });
  }
}
