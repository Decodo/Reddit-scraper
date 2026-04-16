import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueriesController } from './queries.controller';
import { QueriesService } from './queries.service';
import { Query, QuerySchema } from './queries.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Query.name, schema: QuerySchema }]),
  ],
  controllers: [QueriesController],
  providers: [QueriesService],
  exports: [QueriesService],
})
export class QueriesModule {}
