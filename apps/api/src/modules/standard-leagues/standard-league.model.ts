import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Event } from '../events/event.model';

@ObjectType()
export class StandardLeague {
  @Field(() => ID)
  id: string;

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

  @Field(() => Event)
  event: Event;
}
