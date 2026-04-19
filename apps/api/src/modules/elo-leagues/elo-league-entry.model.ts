import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../games/player.model';
import { EloLeague } from './elo-league.model';

@ObjectType()
export class EloLeagueEntry {
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

  @Field(() => EloLeague, { nullable: true })
  league?: EloLeague;
}
