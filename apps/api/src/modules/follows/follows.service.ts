import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';

@Injectable()
export class FollowsService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async toggleGameFollow(userId: string, gameId: string): Promise<boolean> {
    const existing = await this.databaseProvider.userGameFollow.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existing) {
      await this.databaseProvider.userGameFollow.delete({
        where: { userId_gameId: { userId, gameId } },
      });
      return false;
    }

    await this.databaseProvider.userGameFollow.create({
      data: { userId, gameId },
    });
    return true;
  }

  async toggleEventFollow(userId: string, eventId: string): Promise<boolean> {
    const existing = await this.databaseProvider.userEventFollow.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      await this.databaseProvider.userEventFollow.delete({
        where: { userId_eventId: { userId, eventId } },
      });
      return false;
    }

    await this.databaseProvider.userEventFollow.create({
      data: { userId, eventId },
    });
    return true;
  }

  async isFollowingGame(userId: string, gameId: string): Promise<boolean> {
    const follow = await this.databaseProvider.userGameFollow.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    return follow !== null;
  }

  async isFollowingEvent(userId: string, eventId: string): Promise<boolean> {
    const follow = await this.databaseProvider.userEventFollow.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    return follow !== null;
  }
}
