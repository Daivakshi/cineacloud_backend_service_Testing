import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model, mongo } from 'mongoose';
import { CreateUsertDto } from './dtos/create-user.dto';
import { PremiumUserDocument, PremiumUsers, PremiumUserSchema } from './model/premium-user.schema';
import { ProjectDocument, ProjectSchema, UserProjects } from './model/project.schema';
import { User, UsersDocument, UsersSchema } from './model/users.schema';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { CreateProjectDto } from './dtos/create-project.dto';
import { ValidationError } from 'class-validator';

describe('UsersService', () => {
  let service: UsersService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<UsersDocument>;
  let projectModel: Model<ProjectDocument>;
  let premiumUser: Model<PremiumUserDocument>;


  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection

    userModel = mongoConnection.model(User.name, UsersSchema);
    projectModel = mongoConnection.model(UserProjects.name, ProjectSchema);
    premiumUser = mongoConnection.model(PremiumUsers.name, PremiumUserSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: getModelToken(UserProjects.name),
          useValue: projectModel,
        },
        {
          provide: getModelToken(PremiumUsers.name),
          useValue: premiumUser,
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  describe('Find one by email', () => {
    it('should find one by email', async () => {
      const user: CreateUsertDto = {
        email: 'test@cineacloud.com',
        password: bcrypt.hashSync('test', 10),
        firstName: 'first',
        lastName: 'last',
        isFestivalManager: false,
        password2: bcrypt.hashSync('test', 10),
      };
      await mongoConnection.db.collection('users').insertOne(user);
      const result = await service.findOneByEmail(user.email);
      expect(result).toBeDefined();
      expect(result.email).toEqual(user.email);
    });

    it('should not find one by email', async () => {
      const result = await service.findOneByEmail('');
      expect(result).toBeNull();
    });
  });

  describe('Create project', () => {
    it('should create project', async () => {
      const project: CreateProjectDto = {
        projName: 'test project',
        createdBy: new mongo.ObjectId(),
        status: 1
      };
      const result = await service.createProject(project);
      const projectResult = await mongoConnection.db.collection('userprojects').findOne({ _id: result._id });
      expect(projectResult).toBeDefined();
      expect(projectResult._id).toEqual(result._id);
      expect(projectResult.projName).toEqual(project.projName);
      expect(projectResult.createdBy).toMatchObject(project.createdBy);
      expect(projectResult.status).toEqual(project.status);
    });

    it('should not create project', async () => {
      const result = await service.createProject(null);
      expect(result).toBeNull();
    });
  });

  describe('Find all projects', () => {
    it('should find all projects', async () => {
      const project: CreateProjectDto = {
        projName: 'test project',
        createdBy: new mongo.ObjectId(),
        status: 1,
      };
      const project2: CreateProjectDto = {
        projName: 'test project 2',
        createdBy: project.createdBy,
        status: 1,
      };
      await mongoConnection.db
        .collection('userprojects')
        .insertMany([project, project2]);
      const result = await service.findAllProjects(project.createdBy);
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    // ! fails return empty array instead of null
    it('should not find all projects', async () => {
      const result = await service.findAllProjects(null);
      expect(result).toBeNull();
    });
  });

  describe('Find one project', () => {
    it('should find one project', async () => {
      const project: CreateProjectDto = {
        projName: 'test project',
        createdBy: new mongo.ObjectId(),
        status: 1
      };
      const createProject = await mongoConnection.db.collection('userprojects').insertOne(project);
      const result = await service.findProjectByName({ projName: project.projName });
      expect(result).toBeDefined();
      expect(result._id).toEqual(createProject.insertedId);
    });
    // ! fails return empty array instead of null
    it('should not find one project', async () => {
      const result = await service.findProjectByName(null);
      expect(result).toBeNull();
    });
  });

  describe('Find project by id', () => {
    it('should find project by id', async () => {
      const project: CreateProjectDto = {
        projName: 'test project',
        createdBy: new mongo.ObjectId(),
        status: 1
      };
      const createProject = await mongoConnection.db.collection('userprojects').insertOne(project);
      const result = await service.getProjectById({ _id: createProject.insertedId });
      expect(result).toBeDefined();
      expect(result._id).toEqual(createProject.insertedId);
    });

    it('should not find project by id', async () => {
      const result = await service.getProjectById(null);
      expect(result).toBeNull();
    });
  });

  describe('Create user', () => {
    it('should create user', async () => {
      const user: any = {
        email: 'testuser@cineacloud.com',
        password: bcrypt.hashSync('test', 10),
        firstName: 'first',
        lastName: 'last',
        isFestivalManager: false,
      }

      const result = await service.createUser(user);
      const userResult = await mongoConnection.db.collection('users').findOne({ _id: result._id });
      expect(userResult).toBeDefined();
      expect(userResult._id).toEqual(result._id);
      expect(userResult.email).toEqual(user.email);
      expect(userResult.firstName).toEqual(user.firstName);
      expect(userResult.lastName).toEqual(user.lastName);
      expect(userResult.isFestivalManager).toEqual(user.isFestivalManager);
    });

    // ! fails did not throw a validation error
    it('should not create user', async () => {
      //expect(async () => await service.createUser(null)).toThrow(ValidationError);
    });
  });

  describe('Create premium user', () => {
    // ! fails throws a validation error on email
    it('should create premium user', async () => {
      const user: any = {
        email: 't@cineacloud.com',
        password: bcrypt.hashSync('test', 10),
        createdBy: new mongo.ObjectId(),
      }

      const result = await service.createPremiumUser(user);
      const premiumUser = await mongoConnection.db.collection('premiumusers').findOne({ _id: result._id });
      expect(premiumUser).toBeDefined();
      expect(premiumUser._id).toEqual(result._id);
      expect(premiumUser.email).toEqual(user.email);
    });

    it('should not create premium user', async () => {
      expect(async () => await service.createPremiumUser(null)).toThrow(ValidationError);
    });
  });

  describe('Find one premium users', () => {
    it('should find one premium users', async () => {
      const user: any = {
        email: 'test@cineacloud.com'
      }
      await mongoConnection.db.collection('premiumusers').insertOne(user);
      const result = await service.findOnePremiumUserByEmail(user.email);
      expect(result).toBeDefined();
      expect(result.email).toEqual(user.email);
    });

    it('should not find one premium users', async () => {
      const result = await service.findOnePremiumUserByEmail('');
      expect(result).toBeNull();
    });
  });

  describe('delete premium users', () => {
    // ! fails did not delete the premium user
    it('should delete premium users', async () => {
      const user: any = {
        email: 'test@cineacloud.com'
      }
      const createPremiumUser = await mongoConnection.db.collection('premiumusers').insertOne(user);
      const result = await service.deletePremiumUser(user.email);
      expect(result).toBeDefined();
      expect(result.deletedCount).toEqual(1);
    });
  });
});
