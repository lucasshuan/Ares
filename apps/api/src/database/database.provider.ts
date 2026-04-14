import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDatabaseClient, DatabaseClient } from '@ares/db';

@Injectable()
export class DatabaseProvider implements OnModuleInit {
  public db: DatabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');
    this.db = createDatabaseClient(databaseUrl);
  }
}
