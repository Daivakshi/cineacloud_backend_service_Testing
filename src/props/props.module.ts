import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mailer } from '../../src/utils/mailService';
import { ResponseHandler } from '../../src/utils/response.handler';
import { S3FileUpload } from '../../src/utils/s3';
import { PropsMember, PropsMemberSchema } from './models/props-members.schema';
import { Props, PropsSchema } from './models/props.schema';
import { PropsController } from './props.controller';
import { PropsService } from './props.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Props.name,
        schema: PropsSchema
      },
      {
        name: PropsMember.name,
        schema: PropsMemberSchema
      }
    ])
  ],
  controllers: [PropsController],
  providers: [
    PropsService,
    ResponseHandler,
    S3FileUpload,
    Mailer
  ]
})
export class PropsModule { }
