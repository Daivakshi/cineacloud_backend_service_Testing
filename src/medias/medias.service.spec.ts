import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, mongo } from 'mongoose';
import { MediaDocument, Medias, MediaSchema } from '../../src/contract/models/media.schema';
import { MediaUploadDto } from './dtos/media-upload.dto';
import { MediasService } from './medias.service';

describe('MediasService', () => {
  let service: MediasService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let mediaModel: Model<MediaDocument>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection
    mediaModel = mongoConnection.model(Medias.name, MediaSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediasService,
        {
          provide: getModelToken(Medias.name),
          useValue: mediaModel,
        },
      ],
    }).compile();

    service = module.get<MediasService>(MediasService);
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('Store file', () => {
    it('should store file', async () => {
      const file = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId(),
        contractId: new mongo.ObjectId(),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0
      };
      const result = await service.storeFile(file);
      expect(result.fileName).toEqual(file.fileName);
      expect(result.mimeType).toEqual(file.mimeType);
      expect(result.key).toEqual(file.key);
      expect(result.type).toEqual(file.type);
      expect(result.userId).toMatchObject(file.userId);
      expect(result.contractId).toMatchObject(file.contractId);
      expect(result.fileId).toEqual(file.fileId);
      expect(result.sequence).toEqual(file.sequence);
      expect(result.conversionStatus).toEqual(file.conversionStatus);
      expect(result.status).toEqual(file.status);
    });
  });

  describe('Insert multiple', () => {
    it('should insert multiple', async () => {
      const file1 = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId(),
        contractId: new mongo.ObjectId(),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0
      };
      const file2 = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId(),
        contractId: new mongo.ObjectId(),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0
      };
      const files = [ file1, file2];
      const result = await service.insertMultiple([file1, file2]);
      expect(result.length).toEqual(2);
      for (let file in result){
        expect(files[file].fileName).toEqual(files[file].fileName);
        expect(files[file].mimeType).toEqual(files[file].mimeType);
        expect(files[file].key).toEqual(files[file].key);
        expect(files[file].type).toEqual(files[file].type);
        expect(files[file].userId).toMatchObject(files[file].userId);
        expect(files[file].contractId).toMatchObject(files[file].contractId);
        expect(files[file].fileId).toEqual(files[file].fileId);
        expect(files[file].sequence).toEqual(files[file].sequence);
        expect(files[file].conversionStatus).toEqual(files[file].conversionStatus);
        expect(files[file].status).toEqual(files[file].status);
      }
    });

    it('should insert multiple with empty array', async () => {
      const result = await service.insertMultiple([]);
      expect(result.length).toEqual(0);
    });

    // ! This test fails, service inserts a null document
    it('insert multiple with null', async () => {
      const result = await service.insertMultiple(null);
      expect(result.length).toEqual(0);
    });
  });

  describe('Get all files', () => {
    it('should get all files', async () => {
      const file1 = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId(),
        contractId: new mongo.ObjectId(),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0
      };
      const file2 = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId(),
        contractId: new mongo.ObjectId(),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0
      };
      const files = [ file1, file2];
      await service.insertMultiple(files);
      const result = await service.getAll({});
      expect(result.length).toEqual(2);
      for (let file in result){
        expect(result[file].fileName).toEqual(files[file].fileName);
        expect(result[file].mimeType).toEqual(files[file].mimeType);
        expect(result[file].key).toEqual(files[file].key);
        expect(result[file].type).toEqual(files[file].type);
        expect(result[file].userId).toMatchObject(files[file].userId);
        expect(result[file].contractId).toMatchObject(files[file].contractId);
        expect(result[file].fileId).toEqual(files[file].fileId);
        expect(result[file].sequence).toEqual(files[file].sequence);
        expect(result[file].conversionStatus).toEqual(
          files[file].conversionStatus,
        );
        expect(result[file].status).toEqual(files[file].status);
      }
    });
  });

  describe('Get file', () => {
    it('should get file', async () => {
      const file = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId(),
        contractId: new mongo.ObjectId(),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0
      };
      const result = await service.storeFile(file);
      const fileResult = await service.getFile(result._id);
      expect(fileResult.fileName).toEqual(file.fileName);
      expect(fileResult.mimeType).toEqual(file.mimeType);
      expect(fileResult.key).toEqual(file.key);
      expect(fileResult.type).toEqual(file.type);
      expect(fileResult.userId).toMatchObject(file.userId);
      expect(fileResult.contractId).toMatchObject(file.contractId);
      expect(fileResult.fileId).toEqual(file.fileId);
      expect(fileResult.sequence).toEqual(file.sequence);
      expect(fileResult.conversionStatus).toEqual(file.conversionStatus);
      expect(fileResult.status).toEqual(file.status);
    });

    it('get file that does not exist', async () => {
      const result = await service.getFile(new mongo.ObjectId());
      expect(result).toBeNull();
    });
  })

  describe('Delete file', () => {
    it('should delete file', async () => {
      const file = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId(),
        contractId: new mongo.ObjectId(),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0,
      };
      await service.storeFile(file);
      const getFile = await mongoConnection.db.collection('medias').findOne({});
      expect(getFile).not.toBeNull();
      await service.deleteFile({ _id: getFile._id });
      const getFileAfterDelete = await mongoConnection.db.collection('medias').findOne({});
      expect(getFileAfterDelete).toBeNull();
    });
  })
});

