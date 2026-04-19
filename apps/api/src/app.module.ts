import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join, resolve } from 'path';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './database/database.module';
import { GamesModule } from './modules/games/games.module';
import { AuthModule } from './modules/auth/auth.module';
import { EloLeaguesModule } from './modules/elo-leagues/elo-leagues.module';
import { StandardLeaguesModule } from './modules/standard-leagues/standard-leagues.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';
import { parseEnv } from './env';
import { CommonModule } from './common/common.module';
import { pinoLoggerConfig } from './common/configs/pino-logger.config';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(process.cwd(), '.env')],
      validate: (config) => parseEnv(config),
    }),
    LoggerModule.forRoot(pinoLoggerConfig),
    CommonModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          playground: !isProduction,
          introspection: !isProduction,
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuditModule,
    GamesModule,
    AuthModule,
    EloLeaguesModule,
    StandardLeaguesModule,
    UsersModule,
    StorageModule,
  ],
})
export class AppModule {}
