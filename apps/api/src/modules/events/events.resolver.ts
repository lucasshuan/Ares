import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Event } from './event.model';
import { DataLoaderService } from '@/common/dataloaders/dataloader.service';
import { DatabaseProvider } from '@/database/database.provider';
import { Game } from '../games/game.model';

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private dataLoaderService: DataLoaderService,
    private db: DatabaseProvider,
  ) {}

  @ResolveField(() => Game, { name: 'game' })
  async getGame(@Parent() event: Event) {
    return this.dataLoaderService.gameLoader.load(event.gameId);
  }

  @ResolveField(() => Number, { name: 'followCount' })
  async getFollowCount(@Parent() event: Event) {
    const result = await this.db.userEventFollow.count({
      where: { eventId: event.id },
    });
    return result;
  }
}
