import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Game } from '../games/game.model';

@ObjectType()
export class StandardLeague {
  @Field(() => ID)
  id: string;

  @Field()
  gameId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  type: string;

  @Field(() => Boolean)
  allowDraw: boolean;

  @Field(() => Int)
  pointsPerWin: number;

  @Field(() => Int)
  pointsPerDraw: number;

  @Field(() => Int)
  pointsPerLoss: number;

  @Field(() => [String])
  allowedFormats: string[];

  @Field()
  isApproved: boolean;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Game)
  game: Game;
}
