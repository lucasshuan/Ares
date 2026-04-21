import { Module } from '@nestjs/common';
import { EventStaffService } from './event-staff.service';
import { EventStaffResolver } from './event-staff.resolver';

@Module({
  providers: [EventStaffService, EventStaffResolver],
  exports: [EventStaffService],
})
export class EventStaffModule {}
