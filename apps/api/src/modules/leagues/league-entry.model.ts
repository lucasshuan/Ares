import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../games/player.model';
import { League } from './league.model';

@ObjectType()
export class LeagueEntry {
  @Field(() => ID)
  id: string;

  @Field()
  leagueId: string;

  @Field()
  playerId: string;

  @Field(() => Int)
  currentElo: number;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field(() => Player, { nullable: true })
  player?: Player;

  @Field(() => League, { nullable: true })
  league?: League;
}
