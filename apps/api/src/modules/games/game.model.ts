import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../auth/user.model';
import { EloLeague } from '../elo-leagues/elo-league.model';
import { StandardLeague } from '../standard-leagues/standard-league.model';

@ObjectType()
export class GameCounts {
  @Field(() => Int)
  leagues: number;

  @Field(() => Int)
  players: number;
}

@ObjectType()
export class Game {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailImageUrl?: string;

  @Field({ nullable: true })
  backgroundImageUrl?: string;

  @Field({ nullable: true })
  steamUrl?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  authorId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => [EloLeague], { nullable: true })
  eloLeagues?: EloLeague[];

  @Field(() => [StandardLeague], { nullable: true })
  standardLeagues?: StandardLeague[];

  @Field(() => GameCounts, { name: '_count', nullable: true })
  count?: GameCounts;
}
