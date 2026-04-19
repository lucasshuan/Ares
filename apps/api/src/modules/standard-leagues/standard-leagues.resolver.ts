import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Mutation,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../auth/decorators/required-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User as UserModel } from '../auth/user.model';
import { StandardLeague } from './standard-league.model';
import { StandardLeaguesService } from './standard-leagues.service';
import { DataLoaderService } from '@/common/dataloaders/dataloader.service';
import { PaginatedStandardLeagues } from './dto/standard-leagues.output';
import { PaginationInput } from '@/common/pagination/pagination.input';
import { StandardLeagueEntry } from './standard-league-entry.model';
import {
  CreateStandardLeagueInput,
  UpdateStandardLeagueInput,
} from './dto/standard-leagues.input';
import { Game } from '../games/game.model';

@Resolver(() => StandardLeague)
export class StandardLeaguesResolver {
  constructor(
    private standardLeaguesService: StandardLeaguesService,
    private dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => PaginatedStandardLeagues, { name: 'standardLeagues' })
  async getStandardLeagues(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.standardLeaguesService.findAll(
      pagination || new PaginationInput(),
    );
  }

  @Query(() => StandardLeague, { name: 'standardLeague', nullable: true })
  async getStandardLeague(
    @Args('gameSlug') gameSlug: string,
    @Args('slug') slug: string,
  ) {
    return this.standardLeaguesService.findByGameAndSlug(gameSlug, slug);
  }

  @ResolveField(() => Game, { name: 'game' })
  async getGame(@Parent() league: StandardLeague) {
    return this.dataLoaderService.gameLoader.load(league.gameId);
  }

  @ResolveField(() => [StandardLeagueEntry], { name: 'entries' })
  async getEntries(@Parent() league: StandardLeague) {
    return this.dataLoaderService.standardLeagueEntriesLoader.load(league.id);
  }

  @Mutation(() => StandardLeague)
  @UseGuards(GqlAuthGuard)
  async updateStandardLeague(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateStandardLeagueInput,
    @CurrentUser() user: UserModel,
  ) {
    return this.standardLeaguesService.update(
      id,
      input,
      user.isAdmin ? undefined : user.id,
    );
  }

  @Mutation(() => StandardLeague)
  @UseGuards(GqlAuthGuard)
  async createStandardLeague(
    @Args('input') input: CreateStandardLeagueInput,
    @CurrentUser() user: UserModel,
  ) {
    return this.standardLeaguesService.create({ ...input, authorId: user.id });
  }

  @Mutation(() => StandardLeagueEntry)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequiredPermissions('manage_events')
  async addPlayerToStandardLeague(
    @Args('leagueId', { type: () => ID }) leagueId: string,
    @Args('playerId', { type: () => ID }) playerId: string,
  ) {
    return this.standardLeaguesService.addPlayer(leagueId, playerId);
  }

  @Mutation(() => StandardLeagueEntry)
  @UseGuards(GqlAuthGuard)
  async registerSelfToStandardLeague(
    @Args('leagueId', { type: () => ID }) leagueId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.standardLeaguesService.registerSelf(leagueId, user.id);
  }
}
