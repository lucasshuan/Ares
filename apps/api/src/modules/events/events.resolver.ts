import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Event } from './event.model';
import { DataLoaderService } from '@/common/dataloaders/dataloader.service';
import { Game } from '../games/game.model';

@Resolver(() => Event)
export class EventsResolver {
  constructor(private dataLoaderService: DataLoaderService) {}

  @ResolveField(() => Game, { name: 'game' })
  async getGame(@Parent() event: Event) {
    return this.dataLoaderService.gameLoader.load(event.gameId);
  }
}
