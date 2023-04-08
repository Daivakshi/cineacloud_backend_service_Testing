import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, mongo } from 'mongoose';
import { CreatePropsDto } from './dtos/create-prop.dto';
import { PropsMember, PropsMemberDocument, PropsMemberSchema } from './models/props-members.schema';
import { Props, PropsDocument, PropsSchema } from './models/props.schema';
import { PropsService } from './props.service';

describe('PropsService', () => {
  let service: PropsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let propsModel: Model<PropsDocument>;
  let inviteModel: Model<PropsMemberDocument>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    propsModel = mongoConnection.model(Props.name, PropsSchema);
    inviteModel = mongoConnection.model(PropsMember.name, PropsMemberSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropsService,
        {
          provide: getModelToken(Props.name),
          useValue: propsModel,
        },
        {
          provide: getModelToken(PropsMember.name),
          useValue: inviteModel,
        }
      ],
    }).compile();

    service = module.get<PropsService>(PropsService);
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('Create a new prop', () => {
    it('should create a new prop', async () => {
      const prop: CreatePropsDto = {
        item: 'random prop',
      };
      const result = await service.createProps(prop);
      const propResult = await mongoConnection.db
        .collection('props')
        .findOne({ _id: result._id });
      expect(propResult).toBeDefined();
      expect(propResult._id).toEqual(result._id);
    });
  });

  describe('Get all props', () => {
    it('should should return the prop', async () => {
      const prop1: CreatePropsDto = {
        item: 'pickle',
      };

      const prop2: CreatePropsDto = {
        item: 'pickle',
      };

      const prop3: CreatePropsDto = {
        item: 'pickle',
      };

      await mongoConnection.db
        .collection('userprojects')
        .insertMany([prop1, prop2, prop3]);
      const result = await service.getAllProps({ item: 'pickle' }, 0, 1, 1);
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
    });
  });

  describe('update a single prop', () => {
    it('should update the prop', async () => {
      const prop: any = {
        item: 'prop1Item',
        userId: new mongo.ObjectId(),
        status: 1
      };
      const createProp = await mongoConnection.db.collection('props').insertOne(prop);
      const updated = await service.updateProps(new mongo.ObjectId(createProp.insertedId), { item: 'test' });
      expect(updated).toBeDefined();
      expect(updated.item).toEqual('test');
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
