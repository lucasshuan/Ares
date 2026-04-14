import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsResolver } from './rankings.resolver';

@Module({
  providers: [RankingsService, RankingsResolver],
})
export class RankingsModule {}
