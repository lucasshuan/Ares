import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Event } from '../events/event.model';

@ObjectType()
export class EloLeague {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  initialElo: number;

  @Field(() => Boolean)
  allowDraw: boolean;

  @Field(() => Int)
  kFactor: number;

  @Field(() => Float)
  scoreRelevance: number;

  @Field(() => Int)
  inactivityDecay: number;

  @Field(() => Int)
  inactivityThresholdHours: number;

  @Field(() => Int)
  inactivityDecayFloor: number;

  @Field(() => [String])
  allowedFormats: string[];

  @Field(() => Event)
  event: Event;
}
