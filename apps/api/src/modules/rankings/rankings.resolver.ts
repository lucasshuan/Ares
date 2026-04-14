import { Args, Query, Resolver } from '@nestjs/graphql';
import { Ranking } from './ranking.model';
import { RankingsService } from './rankings.service';

@Resolver(() => Ranking)
export class RankingsResolver {
  constructor(private rankingsService: RankingsService) {}

  @Query(() => [Ranking], { name: 'rankings' })
  async getRankings() {
    return this.rankingsService.findAll();
  }

  @Query(() => Ranking, { name: 'ranking', nullable: true })
  async getRanking(@Args('gameId') gameId: string, @Args('slug') slug: string) {
    return this.rankingsService.findByGameAndSlug(gameId, slug);
  }
}
