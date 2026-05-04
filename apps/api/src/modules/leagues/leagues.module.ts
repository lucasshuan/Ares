import { Module } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { LeaguesResolver } from './leagues.resolver';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [LeaguesService, LeaguesResolver],
})
export class LeaguesModule {}
