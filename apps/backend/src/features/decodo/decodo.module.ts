import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { DecodoService } from './decodo.service';

@Module({
  imports: [SettingsModule],
  providers: [DecodoService],
  exports: [DecodoService],
})
export class DecodoModule {}
