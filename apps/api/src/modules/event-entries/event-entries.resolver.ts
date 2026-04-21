import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventEntry } from './event-entry.model';
import { EventEntriesService } from './event-entries.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/user.model';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { PaginatedEventEntries } from './dto/event-entries.output';
import {
  CreateEventEntryInput,
  ClaimEntryInput,
  ReviewClaimInput,
  UpdateEventEntryInput,
} from './dto/event-entries.input';

@Resolver(() => EventEntry)
export class EventEntriesResolver {
  constructor(private eventEntriesService: EventEntriesService) {}

  @Query(() => PaginatedEventEntries, { name: 'eventEntries' })
  async getEventEntries(
    @Args('eventId', { type: () => ID }) eventId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.eventEntriesService.findByEvent(eventId, pagination);
  }

  @Query(() => EventEntry, { name: 'eventEntry', nullable: true })
  async getEventEntry(@Args('id', { type: () => ID }) id: string) {
    return this.eventEntriesService.findById(id);
  }

  @Mutation(() => EventEntry)
  @UseGuards(GqlAuthGuard)
  async addEventEntry(@Args('input') input: CreateEventEntryInput) {
    return this.eventEntriesService.addEntry(input);
  }

  @Mutation(() => EventEntry)
  @UseGuards(GqlAuthGuard)
  async updateEventEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEventEntryInput,
  ) {
    return this.eventEntriesService.updateEntry(id, input);
  }

  @Mutation(() => EventEntry)
  @UseGuards(GqlAuthGuard)
  async claimEventEntry(
    @Args('input') input: ClaimEntryInput,
    @CurrentUser() user: User,
  ) {
    return this.eventEntriesService.claimEntry(input.entryId, user.id, input);
  }

  @Mutation(() => EventEntry)
  @UseGuards(GqlAuthGuard)
  async reviewEntryClaim(
    @Args('input') input: ReviewClaimInput,
    @CurrentUser() user: User,
  ) {
    return this.eventEntriesService.reviewClaim(input, user.id);
  }
}
