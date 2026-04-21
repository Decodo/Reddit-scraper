import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      // Check backend-local overrides first, then fall back to monorepo root .env.
      // This covers both `nest start` from apps/backend/ and running from the repo root.
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
