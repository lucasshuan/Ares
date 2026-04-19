import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../games/player.model';
import { StandardLeague } from './standard-league.model';

@ObjectType()
export class StandardLeagueEntry {
  @Field(() => ID)
  id: string;

  @Field()
  leagueId: string;

  @Field()
  playerId: string;

  @Field(() => Int)
  points: number;

  @Field(() => Int)
  wins: number;

  @Field(() => Int)
  draws: number;

  @Field(() => Int)
  losses: number;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field(() => Player, { nullable: true })
  player?: Player;

  @Field(() => StandardLeague, { nullable: true })
  league?: StandardLeague;
}
