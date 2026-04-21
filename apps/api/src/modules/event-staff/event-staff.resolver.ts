import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventStaff } from './event-staff.model';
import { EventStaffService } from './event-staff.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/user.model';
import { AddEventStaffInput } from './dto/event-staff.input';

@Resolver(() => EventStaff)
export class EventStaffResolver {
  constructor(private eventStaffService: EventStaffService) {}

  @Query(() => [EventStaff], { name: 'eventStaff' })
  async getEventStaff(@Args('eventId', { type: () => ID }) eventId: string) {
    return this.eventStaffService.getStaff(eventId);
  }

  @Mutation(() => EventStaff)
  @UseGuards(GqlAuthGuard)
  async addEventStaff(
    @Args('input') input: AddEventStaffInput,
    @CurrentUser() user: User,
  ) {
    // Only ORGANIZER can manage staff — checked at service layer
    const canManage = await this.eventStaffService.checkRole(
      input.eventId,
      user.id,
      'ORGANIZER',
    );
    if (!canManage) throw new Error('Only organizers can manage event staff');
    return this.eventStaffService.addStaff(
      input.eventId,
      input.userId,
      input.role ?? 'MODERATOR',
    );
  }

  @Mutation(() => EventStaff)
  @UseGuards(GqlAuthGuard)
  async removeEventStaff(
    @Args('eventId', { type: () => ID }) eventId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ) {
    const canManage = await this.eventStaffService.checkRole(
      eventId,
      user.id,
      'ORGANIZER',
    );
    if (!canManage) throw new Error('Only organizers can manage event staff');
    return this.eventStaffService.removeStaff(eventId, userId);
  }
}
