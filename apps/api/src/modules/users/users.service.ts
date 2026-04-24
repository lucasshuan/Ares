import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { Prisma } from '@bellona/db';

@Injectable()
export class UsersService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findByUsername(username: string) {
    return this.databaseProvider.user.findFirst({
      where: {
        username,
      },
    });
  }

  async search(pagination: PaginationInput, query?: string) {
    const { skip, take } = pagination;

    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
            {
              username: { contains: query, mode: Prisma.QueryMode.insensitive },
            },
          ],
        }
      : undefined;

    const [nodes, totalCount] = await Promise.all([
      this.databaseProvider.user.findMany({
        where,
        skip,
        take,
      }),
      this.databaseProvider.user.count({ where }),
    ]);

    return {
      nodes,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }
}
