import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseHandler } from '../../src/utils/response.handler';
import { Notifications, NotificationsSchema } from './model/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notifications.name,
        schema: NotificationsSchema
      }
    ])
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    ResponseHandler
  ]
})
export class NotificationModule {}
