import { ObjectType } from '@nestjs/graphql';
import { StandardLeague } from '../standard-league.model';
import { Paginated } from '../../../common/pagination/pagination.type';

@ObjectType()
export class PaginatedStandardLeagues extends Paginated(StandardLeague) {}
