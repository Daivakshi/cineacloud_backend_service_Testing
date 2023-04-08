import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { ResponseHandler } from '../../src/utils/response.handler';
import {
  vfx_comments,
  CommentsSchema,
  CommentsDoc,
} from './models/comments.schema';
import {
  User,
  UsersDocument,
  UsersSchema,
} from '../../src/users/model/users.schema';
import { mongo } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, ObjectId } from 'mongoose';
import { CreateCommentDto } from './dtos/create-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let commentModel: Model<CommentsDoc>;
  let userModel: Model<UsersDocument>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    commentModel = mongoConnection.model(vfx_comments.name, CommentsSchema);
    userModel = mongoConnection.model(User.name, UsersSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(vfx_comments.name),
          useValue: commentModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        ResponseHandler,
      ],
      imports: [ConfigModule.forRoot({})],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('Create Comment', () => {
    it('creates a comment', async () => {
      const mockComment: CreateCommentDto = {
        appId: new mongo.ObjectId(),
        screenId: new mongo.ObjectId(),
        comment: 'Hi Firnaas',
        type: 'props',
      };

      const res = await service.createComment(mockComment);

      expect(res).toBeDefined();
      expect(res.appId).toEqual(mockComment.appId);
      expect(res.screenId).toEqual(mockComment.screenId);
      expect(res.comment).toEqual(mockComment.comment);
      expect(res.type).toEqual(mockComment.type);
    });

    // it("does not create comment", async () => {
    //   const mockComment : CreateCommentDto = {
    //     appId: undefined,
    //     screenId: undefined, //new mongo.ObjectId(),
    //     comment: undefined, //"Hi Firnaas",
    //     type: undefined
    //   }

    //   const res = await service.createComment(mockComment);
    //   console.log("poopu", res)
    // })
  });

  describe('Get Comment', () => {
    it('gets a specific comment', async () => {
      const mockComment: CreateCommentDto = {
        appId: new mongo.ObjectId(),
        screenId: new mongo.ObjectId(),
        comment: 'Hi Firnaas',
        type: 'props',
      };

      await service.createComment(mockComment);
      const result = await mongoConnection.db
        .collection('vfx_comments')
        .findOne({ appId: mockComment.appId });

      expect(result).toBeDefined();
      expect(result.appId).toEqual(mockComment.appId);
      expect(result.screenId).toEqual(mockComment.screenId);
      expect(result.comment).toEqual(mockComment.comment);
      expect(result.type).toEqual(mockComment.type);
    });

    it('does not get comment due to wrong Id', async () => {
      const mockComment: CreateCommentDto = {
        appId: new mongo.ObjectId(),
        screenId: new mongo.ObjectId(),
        comment: 'Hi Firnaas',
        type: 'props',
      };

      await service.createComment(mockComment);
      const result = await mongoConnection.db
        .collection('vfx_comments')
        .findOne({ appId: new mongo.ObjectId() });
      expect(result).toBe(null);
    });

    it('does not get comment due to wrong type', async () => {
      const mockComment: CreateCommentDto = {
        appId: new mongo.ObjectId(),
        screenId: new mongo.ObjectId(),
        comment: 'Hi Firnaas',
        type: 'props',
      };

      await service.createComment(mockComment);

      const result = await mongoConnection.db
        .collection('vfx_comments')
        .findOne({ appId: mockComment.appId, type: 'wrongType' });
      expect(result).toBe(null);
    });
  });
});
