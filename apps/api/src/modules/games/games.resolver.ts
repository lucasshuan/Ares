import { Args, Query, Resolver } from '@nestjs/graphql';
import { Game } from './game.model';
import { GamesService } from './games.service';

@Resolver(() => Game)
export class GamesResolver {
  constructor(private gamesService: GamesService) {}

  @Query(() => [Game], { name: 'games' })
  async getGames() {
    return this.gamesService.findAll();
  }

  @Query(() => Game, { name: 'game', nullable: true })
  async getGameBySlug(@Args('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }
}
