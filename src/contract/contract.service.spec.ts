import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { getModelToken } from '@nestjs/mongoose';
import { ContractDocument, Contracts, ContractSchema } from './models/contract.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, mongo } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import { ResponseHandler } from '../../src/utils/response.handler';
import { ContractForm, ContractFormDoc, ContractFormSchema } from './models/contract-form.schema';
import { ContractSigners, InviteSignersDocs, SignersSchema } from './models/contract-signer.schema';
import { ContractSigns, ContractSignSchema, SignsDocument } from './models/contract-signs.schema';
import { MediaDocument, Medias, MediaSchema } from './models/media.schema';
import { ContractPdf, ContractPdfDoc, ContractPdfSchema } from './models/contract-pdf-data.schema';
import { CreateContractDto } from './dtos/create-contract.dto';
import { NotFoundException } from '@nestjs/common';

describe('ContractService', () => {
  let service: ContractService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let contractModel: Model<ContractDocument>;
  let formModel: Model<ContractFormDoc>;
  let signersModel: Model<InviteSignersDocs>;
  let signModel: Model<SignsDocument>;
  let mediaModel: Model<MediaDocument>;
  let pdfModel: Model<ContractPdfDoc>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    contractModel = mongoConnection.model(Contracts.name, ContractSchema);
    formModel = mongoConnection.model(ContractForm.name, ContractFormSchema);
    signersModel = mongoConnection.model(ContractSigners.name, SignersSchema);
    signModel = mongoConnection.model(ContractSigns.name, ContractSignSchema);
    mediaModel = mongoConnection.model(Medias.name, MediaSchema);
    pdfModel = mongoConnection.model(ContractPdf.name, ContractPdfSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: getModelToken(Contracts.name),
          useValue: contractModel,
        },
        {
          provide: getModelToken(ContractForm.name),
          useValue: formModel,
        },
        {
          provide: getModelToken(ContractSigners.name),
          useValue: signersModel,
        },
        {
          provide: getModelToken(ContractSigns.name),
          useValue: signModel,
        },
        {
          provide: getModelToken(Medias.name),
          useValue: mediaModel,
        },
        {
          provide: getModelToken(ContractPdf.name),
          useValue: pdfModel,
        },
        ResponseHandler,
      ],
      imports: [ConfigModule.forRoot({})],
    }).compile();
    service = module.get<ContractService>(ContractService);
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  // ! this should probably be a post request instead of a get request from the controller
  describe('Create contract', () => {
    it('Create contract', async () => {
      const contract: CreateContractDto = {
        projectId: new mongo.ObjectId(),
        userId: new mongo.ObjectId(),
        documentStatus: 1,
        name: 'Test Contract',
        isSingleSigner: true,
      }
      await service.createContract(contract);
      const result = await mongoConnection.db.collection('contracts').findOne({ userId: contract.userId });
      expect(result).toBeDefined();
      expect(result.name).toEqual(contract.name);
      expect(result.projectId).toStrictEqual(contract.projectId);
      expect(result.userId).toMatchObject(contract.userId);
      expect(result.isSingleSigner).toEqual(contract.isSingleSigner);
    });
    // ! this test fails because the service does not throw an error when the contract is missing a userId or projectId
    it('Invalid projectId', async () => {
      const contract: any = {
        documentStatus: 1,
        name: 'Test Contract',
        isSingleSigner: true,
      }
      // * you should not be able to create a contract with missing userId or projectId
      expect(await service.createContract(contract)).toThrow();
    });

    describe('Get single contract', () => {
      it('Get single contract', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        }
        const createContract = await service.createContract(contract);
        const result = await service.getSingleContract(createContract.id, contract.userId.toString());
        expect(result).toBeDefined();
        expect(result.name).toEqual(contract.name);
        expect(result.projectId).toStrictEqual(contract.projectId);
        expect(result.userId).toMatchObject(contract.userId);
        expect(result.isSingleSigner).toEqual(contract.isSingleSigner);
      });

      it('Contract not found', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        };
        const createContract = await service.createContract(contract);
        const result = await service.getSingleContract(
          new mongo.ObjectId().toString(),
          contract.userId.toString(),
        );
        expect(result).toBeNull();
      });

      it('Falsy id', async () => {
        const invalidContract = await service.getSingleContract(
          null,
          null,
        );
        expect(invalidContract).toBeNull();
      });

      // ! test fails this should throw an error when the contract id is invalid objectId
      it('Invalid contract id (invalid objectId)', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        };
        const createContract = await service.createContract(contract);
        expect(await service.getSingleContract('invalid_object_id',contract.userId.toString())).toThrow();
      });
    });

    describe('Find one contract', () => {
      it('Find one contract', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        }
        const createContract = await service.createContract(contract);
        const result = await service.findOneContract(createContract.id);
        expect(result).toBeDefined();
        expect(result.name).toEqual(contract.name);
        expect(result.projectId).toStrictEqual(contract.projectId);
        expect(result.userId).toMatchObject(contract.userId);
        expect(result.isSingleSigner).toEqual(contract.isSingleSigner);
      });

      it('Contract not found', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        };
        const createContract = await service.createContract(contract);
        const result = await service.findOneContract(
          new mongo.ObjectId().toString(),
        );
        expect(result).toBeNull();
      });

      it('Falsy id', async () => {
        const invalidContract = await service.findOneContract(
          null,
        );
        expect(invalidContract).toBeNull();
      });

      // ! test fails this should throw an error when the contract id is invalid objectId
      it('Invalid contract id (invalid objectId)', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        };
        const createContract = await service.createContract(contract);
        expect(await service.findOneContract('invalid_object_id')).toThrow();
      });
    });


    // ! this should be refactored updateContractName calls => findOneUpdate and findOneUpdate => getSingleContract
    // ! contract service line 34-50
    describe('Find one and update', () => {
      it('Find one and update', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        }
        const createContract = await service.createContract(contract);
        const result = await service.findOneUpdate(createContract.id, {userId: contract.userId.toString(), name: 'Updated Contract Name'});
        expect(result).toBeDefined();
        expect(result.name).toEqual('Updated Contract Name');
        expect(result.projectId).toStrictEqual(contract.projectId);
        expect(result.userId).toMatchObject(contract.userId);
        expect(result.isSingleSigner).toEqual(contract.isSingleSigner);
      });

      // ! this test fails because the service does not throw an error when the contract is missing a userId or projectId
      it('Contract not found', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        };
        expect(async () => await service.findOneUpdate(
          new mongo.ObjectId().toString(),
          {userId: contract.userId.toString()},
        )).toThrow(NotFoundException);
      });
    });

    // ! this should be refactored updateContractName calls => findOneUpdate and findOneUpdate => getSingleContract
    describe('Update contract name', () => {
      it('Update contract name', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        }
        const createContract = await service.createContract(contract);
        const result = await service.updateContractName(createContract.id, {
          userId: contract.userId,
          name: 'Updated Contract Name',
        });
        expect(result).toBeDefined();
        expect(result.name).toEqual('Updated Contract Name');
        expect(result.projectId).toStrictEqual(contract.projectId);
        expect(result.userId).toMatchObject(contract.userId);
        expect(result.isSingleSigner).toEqual(contract.isSingleSigner);
      });

      // ! this test fails because the service does not throw an error when the contract is missing a userId or projectId
      it('Contract not found', async () => {
        const contract: CreateContractDto = {
          projectId: new mongo.ObjectId(),
          userId: new mongo.ObjectId(),
          documentStatus: 1,
          name: 'Test Contract',
          isSingleSigner: true,
        };
        expect(async () =>
          await service.updateContractName(new mongo.ObjectId().toString(), {
            userId: contract.userId,
            name: 'Updated Contract Name',
          }),
        ).toThrow(NotFoundException);
      });
    });

    // ! refactor this to use findOneUpdate without other method calls
    describe('Update single signer', () => {});
  });
});
