import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import {
  CreateMatchInput,
  UpdateMatchInput,
  RecordOutcomeInput,
} from './dto/matches.input';

@Injectable()
export class MatchesService {
  constructor(private db: DatabaseProvider) {}

  async findByEvent(eventId: string) {
    return this.db.match.findMany({
      where: { eventId },
      include: { participants: true, attachments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.db.match.findUnique({
      where: { id },
      include: { participants: true, attachments: true },
    });
  }

  async createMatch(input: CreateMatchInput) {
    const { participants, ...matchData } = input;

    return this.db.match.create({
      data: {
        eventId: matchData.eventId,
        phaseId: matchData.phaseId,
        format: matchData.format as never,
        description: matchData.description,
        scheduledAt: matchData.scheduledAt,
        playedAt: matchData.playedAt,
        ...(participants?.length && {
          participants: {
            create: participants.map((p) => ({
              entryId: p.entryId,
              outcome: p.outcome as never,
              score: p.score,
            })),
          },
        }),
      },
      include: { participants: true, attachments: true },
    });
  }

  async updateMatch(id: string, input: UpdateMatchInput) {
    const { participants: _p, eventId: _e, ...rest } = input;
    return this.db.match.update({
      where: { id },
      data: rest as never,
      include: { participants: true, attachments: true },
    });
  }

  async recordOutcome(input: RecordOutcomeInput) {
    await this.db.match.findUniqueOrThrow({
      where: { id: input.matchId },
    });

    return this.db.$transaction(async (tx) => {
      // Upsert each participant outcome
      for (const p of input.participants) {
        await tx.matchParticipant.upsert({
          where: {
            matchId_entryId: { matchId: input.matchId, entryId: p.entryId },
          },
          create: {
            matchId: input.matchId,
            entryId: p.entryId,
            outcome: p.outcome as never,
            score: p.score ?? null,
          },
          update: {
            outcome: p.outcome as never,
            score: p.score ?? null,
          },
        });
      }

      return tx.match.update({
        where: { id: input.matchId },
        data: { playedAt: input.playedAt ?? new Date() },
        include: { participants: true, attachments: true },
      });
    });
  }
}
