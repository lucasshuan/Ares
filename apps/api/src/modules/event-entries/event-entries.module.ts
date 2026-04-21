import { Module } from '@nestjs/common';
import { EventEntriesService } from './event-entries.service';
import { EventEntriesResolver } from './event-entries.resolver';

@Module({
  providers: [EventEntriesService, EventEntriesResolver],
  exports: [EventEntriesService],
})
export class EventEntriesModule {}
