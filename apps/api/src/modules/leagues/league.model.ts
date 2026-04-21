import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Event } from '../events/event.model';

@ObjectType()
export class League {
  // PK is eventId — the league *is* the event
  @Field(() => ID)
  eventId: string;

  @Field()
  classificationSystem: string;

  @Field(() => Object)
  config: unknown;

  @Field()
  allowDraw: boolean;

  @Field(() => [String])
  allowedFormats: string[];

  @Field(() => Object, { nullable: true })
  customFieldSchema?: unknown;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Populated by ResolveField in resolver (not always present)
  @Field(() => Event, { nullable: true })
  event?: Event;
}
