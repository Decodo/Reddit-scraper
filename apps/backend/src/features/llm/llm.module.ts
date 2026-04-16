import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { LlmService } from './llm.service';

@Module({
  imports: [SettingsModule],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
