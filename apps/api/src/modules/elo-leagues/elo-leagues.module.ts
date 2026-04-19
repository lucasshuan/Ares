import { Module } from '@nestjs/common';
import { EloLeaguesService } from './elo-leagues.service';
import { EloLeaguesResolver } from './elo-leagues.resolver';

@Module({
  providers: [EloLeaguesService, EloLeaguesResolver],
})
export class EloLeaguesModule {}
