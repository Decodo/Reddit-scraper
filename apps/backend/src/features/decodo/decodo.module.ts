import { Module } from '@nestjs/common';
import { DecodoService } from './decodo.service';

@Module({
  providers: [DecodoService],
  exports: [DecodoService],
})
export class DecodoModule {}
