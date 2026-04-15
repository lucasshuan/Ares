import { ObjectType } from '@nestjs/graphql';
import { League } from '../league.model';
import { Paginated } from '../../../common/pagination/pagination.type';

@ObjectType()
export class PaginatedLeagues extends Paginated(League) {}
