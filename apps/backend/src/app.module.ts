import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService, DatabaseModule } from './shared';
import { ItemsModule } from './features/items/items.module';
import { QueriesModule } from './features/queries/queries.module';
import { SettingsModule } from './features/settings/settings.module';
import { TrackerModule } from './features/tracker/tracker.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.redis.host,
          port: configService.redis.port,
          db: configService.redis.db,
          ...(configService.redis.password
            ? { password: configService.redis.password }
            : {}),
        },
      }),
    }),
    // Add feature modules here
    ItemsModule,
    QueriesModule,
    SettingsModule,
    TrackerModule,
  ],
})
export class AppModule {}
