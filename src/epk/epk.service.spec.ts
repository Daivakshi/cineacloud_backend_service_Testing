import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'aws-sdk';
import { connect, Connection, Model, ObjectId } from 'mongoose';
import { Mailer } from '../../src/utils/mailService';
import { ResponseHandler } from '../../src/utils/response.handler';
import { S3FileUpload } from '../../src/utils/s3';
import { CreateEpkDto } from './dtos/create-epk.dto';
import { EpkTemplatesService } from './epk-templates/epk-templates.service';
import { EpkController } from './epk.controller';
import { EpkService } from './epk.service';
import { EpkTemplates } from './models/epk-template.schema';
import { EpkDocument, Epks, EpkSchema } from './models/epk.schema';
import { InviteMembers, InviteMembersDocs, InviteMembersSchema } from './models/invite.schema';
import { mongo } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotFoundException } from '@nestjs/common';
import { InviteMembersDto } from './dtos/invite-members.dto';
import { AddMembersDto } from './dtos/create-member.dto';


describe('EpkService', () => {
  let service: EpkService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let epkModel: Model<EpkDocument>;
  let inviteModel: Model<InviteMembersDocs>

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    epkModel = mongoConnection.model(Epks.name, EpkSchema);
    inviteModel = mongoConnection.model(InviteMembers.name, InviteMembersSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EpkController],
      providers: [
        EpkService,
        EpkTemplatesService,
        S3FileUpload,
        ConfigService,
        Mailer,
        {
          provide: getModelToken(Epks.name),
          useValue: epkModel,
        },
        {
          provide: getModelToken(InviteMembers.name),
          useValue: inviteModel,
        },
        {
          provide: getModelToken(EpkTemplates.name),
          useValue: jest.fn(),
        },
        ResponseHandler,
      ],
      imports: [ConfigModule.forRoot({})],
    }).compile();

    service = module.get<EpkService>(EpkService);
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('createEpk', () => {
    it('Create Epk', async () => {
      const data: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: new mongo.ObjectId(),
      };
      const result = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: data.projectId,
        userId: data.userId,
      };

      const created = await service.createEpk(data);
      expect(created.epkName).toBe(result.epkName);
      expect(created.width).toBe(result.width);
      expect(created.height).toBe(result.height);
      expect(created.projectId).toBe(result.projectId);
      expect(created.userId).toBe(result.userId);
    });

    // * createEpk should throw an error if the data is invalid
    it('Create invalid Epk', async () => {
      const data: any = {
        epkName: 'test',
        width: '100',
        height: '100',
      };
      expect(await service.createEpk(data)).toThrowError();
    });
  });

  describe('Find one Epk', () => {
    it('Find one Epk', async () => {
      const data: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: new mongo.ObjectId(),
      };
      
      const create = await mongoConnection.db.collection('epks').insertOne(data);
      const found = await service.findOneEpk({ _id: create.insertedId });
      expect(found.epkName).toBe(data.epkName);
      expect(found.width).toBe(data.width);
      expect(found.height).toBe(data.height);
      expect(found.projectId).toStrictEqual(data.projectId);
      expect(found.userId).toStrictEqual(data.userId);
    });
  });

  describe('Get all Epk', () => {
    it('Get all Epk', async () => {
      const data1: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: new mongo.ObjectId(),
      };
      const data2: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: new mongo.ObjectId(),
      };
      await mongoConnection.db
        .collection('epks')
        .insertMany([data1, data2]);
      const getAll = await service.getAllEpk(null);
      expect(getAll[0].epkName).toBe(data1.epkName);
      expect(getAll[0].width).toBe(data1.width);
      expect(getAll[0].height).toBe(data1.height);
      expect(getAll[0].projectId).toStrictEqual(data1.projectId);
      expect(getAll[0].userId).toStrictEqual(data1.userId);
      expect(getAll[1].epkName).toBe(data2.epkName);
      expect(getAll[1].width).toBe(data2.width);
      expect(getAll[1].height).toBe(data2.height);
      expect(getAll[1].projectId).toStrictEqual(data2.projectId);
      expect(getAll[1].userId).toStrictEqual(data2.userId);
    });
  });

  describe('Get Total Count', () => {
    it('Get Total Count', async () => {
      const createUser = await mongoConnection.db.collection('users').insertOne({
        email: "test@cineacloud.com",
        status: 1
      });
      const data: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: createUser.insertedId,
      };
      const zero_count = await service.getTotalCount({});
      expect(zero_count.length).toBe(0);
      await mongoConnection.db.collection('epks').insertOne(data);
      const count = await service.getTotalCount({});
      expect(count.length).toBe(1);
    });
  });

  describe('Check access', () => {
    it('Has access', async () => {
      const createUser = await mongoConnection.db.collection('users').insertOne({
        email: "test@cineacloud.com"
      })
      const data: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: createUser.insertedId,
      };
      await mongoConnection.db.collection('epks').insertOne(data);
      const hasAccess = await service.checkAccess({});
      expect(hasAccess.epkName).toBe(data.epkName);
      expect(hasAccess.width).toBe(data.width);
      expect(hasAccess.height).toBe(data.height);
      expect(hasAccess.projectId).toStrictEqual(data.projectId);
      expect(hasAccess.userId).toStrictEqual(data.userId);
    });

    it('Has no access', async () => {
      const hasAccess = await service.checkAccess({userId: -999});
      expect(hasAccess).toStrictEqual({});
    });
  });

  // getAllEpkMembers
  describe('Get All Epk Members', () => {
    it('Get All Epk Members', async () => {
      // const createUser = await mongoConnection.db.collection('users').insertOne({
      //   email: ""})
    });
  });

  describe('Find one and update Epk', () => {
    it('Find one and update Epk', async () => {
      const user = {
        email: 'test@cineacloud.com',
        status: 1,
        userId: new mongo.ObjectId(),
      };
      const createUser = await mongoConnection.db.collection('users').insertOne(user);
      const data: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: user.userId,
      };
      const createEpk = await mongoConnection.db.collection('epks').insertOne(data);
      const updatedEpk = await service.finOneAndUpdateEpk(createEpk.insertedId, {
        epkName: 'updated', 
        userId: user.userId
      });
      expect(updatedEpk.epkName).toBe('updated');
    });

    it('Item does not exist', async () => {
      try {
        await service.finOneAndUpdateEpk(new mongo.ObjectID(), {})
        expect(true).toBe(false) // this should never be reached
      } catch(err){
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  })

  describe('Update Epk', () => {
    it('Update Epk', async () => {
      // TODO NOT USED IN CONTROLLER CURRENTLY    
    });
  });

  describe('Delete Epk', () => {
    it('Delete Epk', async () => {
      const data: CreateEpkDto = {
        epkName: 'test',
        width: '100',
        height: '100',
        projectId: new mongo.ObjectId(),
        userId: new mongo.ObjectId(),
      };
      const createEpk = await mongoConnection.db
        .collection('epks')
        .insertOne(data);
      const deleted = await service.deleteEpk({_id: createEpk.insertedId});
      expect(deleted.deletedCount).toBe(1);
      const found = await mongoConnection.db.collection('epks').findOne({_id: createEpk.insertedId});
      expect(found).toBeNull();
    });

    it('Item does not exist', async () => {
      const deleted = await service.deleteEpk({_id: new mongo.ObjectID()})
      expect(deleted.deletedCount).toBe(0);
    });
  })


  describe('Create Members', () => {
    it('Create Members', async () => {
      const member: AddMembersDto = {
        email: 'test@cineacloud.com',
        name: "test",
        createdBy: new mongo.ObjectId(),
        epkId: new mongo.ObjectId().toString(),
      }
      const created = await service.createMembers(member);
      expect(created.email).toBe(member.email);
      expect(created.name).toBe(member.name);
      expect(created.createdBy).toStrictEqual(member.createdBy);
      expect(created.epkId.toString()).toBe(member.epkId.toString());
    })
  })

  describe('Check signers', () => {
    it('Check signers', async () => {
      const addMembers: AddMembersDto[] = [
        {
          email: 'test1@cineacloud.com',
          name: "test1",
          createdBy: new mongo.ObjectId(),
          epkId: new mongo.ObjectId().toString(),
        }, 
        {
          email: 'test2@cineacloud.com',
          name: "test2",
          createdBy: new mongo.ObjectId(),
          epkId: new mongo.ObjectId().toString(),
        }
      ]
      const inviteMembers: InviteMembersDto = {
        epkId: new mongo.ObjectId().toString(),
        addMembers: addMembers,
        removeMembers: []
      }
      await service.checkSigners(inviteMembers);

      })
    })

    describe('Get all members by Epk', () => {
      it('Get all members by Epk', async () => {
        const addMembers: AddMembersDto[] = [
          {
            email: 'test1@cineacloud.com',
            name: "test1",
            createdBy: new mongo.ObjectId(),
            epkId: new mongo.ObjectId().toString(),
          }, 
          {
            email: 'test2@cineacloud.com',
            name: "test2",
            createdBy: new mongo.ObjectId(),
            epkId: new mongo.ObjectId().toString(),
          }
        ]
      // * Not sure what the collection name should be, 
      // * there is no corresponding postman endpoint for this service
      // const insert = await mongoConnection.db
      //   .collection('InviteMembers')
      //   .insertMany(addMembers);    
      const members = await service.getAllMembersByEpk(addMembers[0].epkId);

      expect(members.length).toBe(0);
      })

      
      // * These services are not used in any controller, probably should be commented out or removed
      describe('delete members', () => {});

      describe('get members id', () => {});

      describe('members find one and update', () => {});

      describe('members update', () => {});
  });
})
