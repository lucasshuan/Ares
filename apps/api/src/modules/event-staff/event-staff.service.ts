import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';

@Injectable()
export class EventStaffService {
  constructor(private db: DatabaseProvider) {}

  async getStaff(eventId: string) {
    return this.db.eventStaff.findMany({
      where: { eventId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addStaff(eventId: string, userId: string, role: string) {
    return this.db.eventStaff.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, role: role as never },
      update: { role: role as never },
      include: { user: true },
    });
  }

  async removeStaff(eventId: string, userId: string) {
    return this.db.eventStaff.delete({
      where: { eventId_userId: { eventId, userId } },
    });
  }

  /**
   * Returns true if userId has at least minRole on the event.
   * Role hierarchy: ORGANIZER > MODERATOR > SCOREKEEPER
   */
  async checkRole(
    eventId: string,
    userId: string,
    minRole: 'ORGANIZER' | 'MODERATOR' | 'SCOREKEEPER',
  ): Promise<boolean> {
    const hierarchy: Record<string, number> = {
      SCOREKEEPER: 1,
      MODERATOR: 2,
      ORGANIZER: 3,
    };

    const staff = await this.db.eventStaff.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { role: true },
    });

    if (!staff) return false;
    return hierarchy[staff.role] >= hierarchy[minRole];
  }
}
