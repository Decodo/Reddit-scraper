import { Module } from '@nestjs/common';
import { ConfigModule, DatabaseModule } from './shared';
import { QueriesModule } from './features/queries/queries.module';
import { SettingsModule } from './features/settings/settings.module';
import { TrackerModule } from './features/tracker/tracker.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    QueriesModule,
    SettingsModule,
    TrackerModule,
  ],
})
export class AppModule {}
