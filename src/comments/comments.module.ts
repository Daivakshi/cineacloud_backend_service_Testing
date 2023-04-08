import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Medias, MediaSchema } from '../../src/contract/models/media.schema';
import { MediasService } from '../../src/medias/medias.service';
import { PropsMember, PropsMemberSchema } from '../../src/props/models/props-members.schema';
import { Props, PropsSchema } from '../../src/props/models/props.schema';
import { PropsService } from '../../src/props/props.service';
import { User, UsersSchema } from '../../src/users/model/users.schema';
import { PusherService } from '../../src/utils/pusher';
import { ResponseHandler } from '../../src/utils/response.handler';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { vfx_comments, CommentsSchema } from './models/comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: vfx_comments.name,
        schema: CommentsSchema
      },
      {
        name: User.name,
        schema: UsersSchema
      },
      {
        name: Props.name,
        schema: PropsSchema
      },
      {
        name: PropsMember.name,
        schema: PropsMemberSchema
      },
      {
        name: Medias.name,
        schema: MediaSchema
      }
    ])
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    ResponseHandler,
    PusherService,
    PropsService,
    MediasService
  ]
})
export class CommentsModule {}
