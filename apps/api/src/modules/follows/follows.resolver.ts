import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/user.model';
import { FollowsService } from './follows.service';

@Resolver()
export class FollowsResolver {
  constructor(private followsService: FollowsService) {}

  @Mutation(() => Boolean, {
    description:
      'Toggle follow on a game. Returns true if now following, false if unfollowed.',
  })
  @UseGuards(GqlAuthGuard)
  async toggleGameFollow(
    @Args('gameId', { type: () => ID }) gameId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.followsService.toggleGameFollow(user.id, gameId);
  }

  @Mutation(() => Boolean, {
    description:
      'Toggle follow on an event. Returns true if now following, false if unfollowed.',
  })
  @UseGuards(GqlAuthGuard)
  async toggleEventFollow(
    @Args('eventId', { type: () => ID }) eventId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.followsService.toggleEventFollow(user.id, eventId);
  }

  @Query(() => Boolean, { name: 'isFollowingGame' })
  @UseGuards(GqlAuthGuard)
  async isFollowingGame(
    @Args('gameId', { type: () => ID }) gameId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.followsService.isFollowingGame(user.id, gameId);
  }

  @Query(() => Boolean, { name: 'isFollowingEvent' })
  @UseGuards(GqlAuthGuard)
  async isFollowingEvent(
    @Args('eventId', { type: () => ID }) eventId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.followsService.isFollowingEvent(user.id, eventId);
  }

  @Query(() => Number, { name: 'gameFollowCount' })
  async gameFollowCount(
    @Args('gameId', { type: () => ID }) gameId: string,
  ): Promise<number> {
    return this.followsService.gameFollowCount(gameId);
  }

  @Query(() => Number, { name: 'eventFollowCount' })
  async eventFollowCount(
    @Args('eventId', { type: () => ID }) eventId: string,
  ): Promise<number> {
    return this.followsService.eventFollowCount(eventId);
  }
}
