import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Match } from './match.model';
import { MatchesService } from './matches.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import {
  CreateMatchInput,
  UpdateMatchInput,
  RecordOutcomeInput,
} from './dto/matches.input';

@Resolver(() => Match)
export class MatchesResolver {
  constructor(private matchesService: MatchesService) {}

  @Query(() => [Match], { name: 'eventMatches' })
  async getEventMatches(@Args('eventId', { type: () => ID }) eventId: string) {
    return this.matchesService.findByEvent(eventId);
  }

  @Query(() => Match, { name: 'match', nullable: true })
  async getMatch(@Args('id', { type: () => ID }) id: string) {
    return this.matchesService.findById(id);
  }

  @Mutation(() => Match)
  @UseGuards(GqlAuthGuard)
  async createMatch(@Args('input') input: CreateMatchInput) {
    return this.matchesService.createMatch(input);
  }

  @Mutation(() => Match)
  @UseGuards(GqlAuthGuard)
  async updateMatch(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMatchInput,
  ) {
    return this.matchesService.updateMatch(id, input);
  }

  @Mutation(() => Match)
  @UseGuards(GqlAuthGuard)
  async recordMatchOutcome(@Args('input') input: RecordOutcomeInput) {
    return this.matchesService.recordOutcome(input);
  }
}
