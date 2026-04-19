import { ObjectType } from '@nestjs/graphql';
import { EloLeague } from '../elo-league.model';
import { Paginated } from '../../../common/pagination/pagination.type';

@ObjectType()
export class PaginatedEloLeagues extends Paginated(EloLeague) {}
