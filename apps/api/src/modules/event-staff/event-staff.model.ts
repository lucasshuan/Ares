import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../auth/user.model';

@ObjectType()
export class EventStaff {
  @Field(() => ID)
  id: string;

  @Field()
  eventId: string;

  @Field()
  userId: string;

  @Field()
  role: string;

  @Field()
  createdAt: Date;

  @Field(() => User, { nullable: true })
  user?: User;
}
