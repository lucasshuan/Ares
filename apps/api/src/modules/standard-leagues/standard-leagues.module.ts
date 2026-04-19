import { Module } from '@nestjs/common';
import { StandardLeaguesService } from './standard-leagues.service';
import { StandardLeaguesResolver } from './standard-leagues.resolver';

@Module({
  providers: [StandardLeaguesService, StandardLeaguesResolver],
})
export class StandardLeaguesModule {}
