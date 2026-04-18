import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesResolver } from './games.resolver';
import { PlayersResolver } from './players.resolver';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [GamesService, GamesResolver, PlayersResolver],
})
export class GamesModule {}
