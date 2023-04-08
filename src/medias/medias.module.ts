import { Module } from '@nestjs/common';
import { MediasController } from './medias.controller';
import { MediasService } from './medias.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseHandler } from '../../src/utils/response.handler';
import { S3FileUpload } from '../../src/utils/s3';
import { Medias, MediaSchema } from '../contract/models/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Medias.name,
        schema: MediaSchema
      }
    ])
  ],
  controllers: [MediasController],
  providers: [
    MediasService,
    ResponseHandler,
    S3FileUpload
  ]
})
export class MediasModule {}
