import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EpkElementsController } from './epk-elements.controller';
import { EpkElementsService } from './epk-elements.service';
import { ResponseHandler } from '../../utils/response.handler';
import { Elements, ElementsSchema } from '../models/elements.schema';
import { S3FileUpload } from '../../utils/s3';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Elements.name,
        schema: ElementsSchema
      }
    ])
  ],
  controllers: [
    EpkElementsController
  ],
  providers: [
    EpkElementsService,
    ResponseHandler,
    S3FileUpload
  ]
})
export class EpkElementsModule { }
