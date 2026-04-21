import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MatchAttachment {
  @Field(() => ID)
  id: string;

  @Field()
  matchId: string;

  @Field()
  url: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  label?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class MatchParticipant {
  @Field(() => ID)
  id: string;

  @Field()
  matchId: string;

  @Field()
  entryId: string;

  @Field()
  outcome: string;

  @Field(() => Number, { nullable: true })
  score?: number;

  @Field(() => Float, { nullable: true })
  ratingChange?: number;

  @Field(() => Object, { nullable: true })
  customStats?: unknown;

  @Field(() => [MatchAttachment], { nullable: true })
  attachments?: MatchAttachment[];
}

@ObjectType()
export class Match {
  @Field(() => ID)
  id: string;

  @Field()
  eventId: string;

  @Field({ nullable: true })
  phaseId?: string;

  @Field()
  format: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  playedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [MatchParticipant], { nullable: true })
  participants?: MatchParticipant[];

  @Field(() => [MatchAttachment], { nullable: true })
  attachments?: MatchAttachment[];
}
