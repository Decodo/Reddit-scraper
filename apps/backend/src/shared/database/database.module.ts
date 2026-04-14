import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '../config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongodb.uri,
        retryWrites: true,
        retryReads: true,
        maxPoolSize: 20,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
        socketTimeoutMS: 45000,
      }),
    }),
  ],
})
export class DatabaseModule {}
