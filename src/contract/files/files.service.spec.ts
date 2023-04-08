import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { S3FileUpload } from '../../utils/s3';
import { MediaDocument, Medias, MediaSchema } from '../models/media.schema';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let mediaModel: Model<MediaDocument>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    mediaModel = mongoConnection.model(Medias.name, MediaSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        S3FileUpload,
        {
          provide: getModelToken(Medias.name),
          useValue: mediaModel,
        },
      ],
      imports: [ConfigModule.forRoot({})],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
