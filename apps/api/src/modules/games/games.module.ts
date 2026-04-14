import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesResolver } from './games.resolver';

@Module({
  providers: [GamesService, GamesResolver],
})
export class GamesModule {}
