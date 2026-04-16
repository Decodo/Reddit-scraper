import { Module } from '@nestjs/common';
import { ConfigModule, DatabaseModule } from './shared';
import { ItemsModule } from './features/items/items.module';
import { QueriesModule } from './features/queries/queries.module';
import { SettingsModule } from './features/settings/settings.module';
import { TrackerModule } from './features/tracker/tracker.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ItemsModule,
    QueriesModule,
    SettingsModule,
    TrackerModule,
  ],
})
export class AppModule {}
