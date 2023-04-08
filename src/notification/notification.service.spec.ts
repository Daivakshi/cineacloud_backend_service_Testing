import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { ResponseHandler } from '../../src/utils/response.handler';
import {
  Notifications,
  NotificationsSchema,
  NotificationsDocument,
} from './model/notification.schema';
import {
  User,
  UsersDocument,
  UsersSchema,
} from '../../src/users/model/users.schema';
import { mongo } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, ObjectId, Types } from 'mongoose';

describe('NotificationService', () => {
  let service: NotificationService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let notificationModel: Model<NotificationsDocument>;
  let userModel: Model<UsersDocument>;
  let userId: Types.ObjectId;
  let notification1: NotificationsDocument;
  let notification2: NotificationsDocument;
  let notification3: NotificationsDocument;
  let notificationArr: NotificationsDocument[];

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    notificationModel = mongoConnection.model(
      Notifications.name,
      NotificationsSchema,
    );
    userModel = mongoConnection.model(User.name, UsersSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken(Notifications.name),
          useValue: notificationModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        ResponseHandler,
      ],
      imports: [ConfigModule.forRoot({})],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    userId = new mongo.ObjectId();
    notification1 = new notificationModel({
      notificationType: 'generalNotification',
      isSeen: false,
      isDeleted: false,
      message: 'test notification 1',
      userId,
    });
    notification2 = new notificationModel({
      notificationType: 'vfxNotification',
      isSeen: false,
      isDeleted: false,
      message: 'test notification 2',
      userId,
    });
    notification3 = new notificationModel({
      notificationType: 'projectNotification',
      isSeen: false,
      isDeleted: false,
      message: 'test notification 3',
      userId,
    });
    notificationArr = [notification1, notification2, notification3];
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('List All Notifications', () => {
    it('returns empty array', async () => {
      let result = await mongoConnection.db
        .collection('notifications')
        .findOne({ userId: new mongo.ObjectId() });
      expect(result).toBe(null);
    });

    //this is a route test idea actually: dont pass in userId when trying to find notifications. Should not work. Should return null or give error

    it('returns all notifications', async () => {
      await mongoConnection.db
        .collection('notifications')
        .insertMany(notificationArr);
      let result = await mongoConnection.db
        .collection('notifications')
        .find({ userId })
        .toArray();

      expect(result.length).toBe(notificationArr.length);
      result.forEach((n) => {
        expect(n.userId).toEqual(userId);
      });
    });

    it('does not return notifications due to incorrect userId', async () => {
      await mongoConnection.db
        .collection('notifications')
        .insertMany(notificationArr);
      let result = await mongoConnection.db
        .collection('notifications')
        .find({ userId: new mongo.ObjectId() })
        .toArray();

      expect(result).toEqual([]);
    });
  });

  describe('Update Notification Count', () => {
    it('updates all specific user notifications to seen', async () => {
      await mongoConnection.db
        .collection('notifications')
        .insertMany(notificationArr);

      await service.updateMany({ userId });

      const result = await mongoConnection.db
        .collection('notifications')
        .find({ userId })
        .toArray();
      expect(result.length).toBe(notificationArr.length);
      result.forEach((n) => {
        expect(n.userId).toEqual(userId);
        expect(n.isSeen).toEqual(true);
      });
    });

    it('gets accurate notification count > 0', async () => {
      await mongoConnection.db
        .collection('notifications')
        .insertMany(notificationArr);

      const result = await service.getNotificationCount({
        userId,
        isDeleted: false,
        isSeen: false,
      });
      expect(result.length).toEqual(notificationArr.length);
    });

    it('gets accurate notification count = 0', async () => {
      const newUserId = new mongo.ObjectId();

      const result = await service.getNotificationCount({
        newUserId,
        isDeleted: false,
        isSeen: false,
      });
      expect(result.length).toEqual(0);
    });
  });
});
