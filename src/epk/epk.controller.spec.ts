import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { CreateEpkDto } from './dtos/create-epk.dto';
import { mongo } from 'mongoose';
import { InviteMembersDto } from './dtos/invite-members.dto';
import { AddMembersDto } from './dtos/create-member.dto';

describe('EpkController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /epk/create', () => {
    // ! test fails with a 200 error, should return 201 for successful creation
    it('POST /epk/create', async () => {
      let token;
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });

      const createEpk: CreateEpkDto = {
        epkName: 'test',
        height: '100',
        width: '100',
        projectId: new mongo.ObjectId('642a35fa67354f1cbfd14386'),
        epkId: new mongo.ObjectId('6429c96f608b52aa20750862'),
      };
      return request(app.getHttpServer())
        .post('/epk/create')
        .set('Authorization', token)
        .send(createEpk)
        .expect(201)
    })

    // ! test fails with a 500 error, should return 401 for missing auth token
    it('POST /epk/create with missing auth token', async () => {
      const createEpk: CreateEpkDto = {
        epkName: 'test',
        height: '100',
        width: '100',
        projectId: new mongo.ObjectId('6427bcf63366cd5e582a8c9f'),
      };
      return request(app.getHttpServer())
        .post('/epk/create')
        .send(createEpk)
        .expect(401)
    });

    it('POST /epk/create with missing epkId', async () => {
       let token;
       await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });
      
      const createEpk: CreateEpkDto = {
        epkName: 'test',
        height: '100',
        width: '100',
        projectId: new mongo.ObjectId('6427bcf63366cd5e582a8c9f'),
      };

      return request(app.getHttpServer())
        .post('/epk/create')
        .set('Authorization', token)
        .send(createEpk)
        .expect(400)
    });

    it('POST /epk/create with invalid project id', async () => {
      let token;
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });

      const createEpk: CreateEpkDto = {
        epkName: 'test',
        height: '100',
        width: '100',
        projectId: new mongo.ObjectId(),
      };

      return request(app.getHttpServer())
        .post('/epk/create')
        .set('Authorization', token)
        .send(createEpk)
        .expect(400);
    });
  });

  describe('GET /epk/getAll', () => {
    it('GET /epk/getAll', async () => {
      let token;
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        })

      return request(app.getHttpServer())
        .get('/epk')
        .set('Authorization', token)
        .expect(200)
    })

    // ! test fails with 500 error, should return 401 for missing auth token
    it('GET /epk/getAll with missing auth token', async () => {
      return request(app.getHttpServer())
        .get('/epk')
        .expect(401)
    })
  })

  describe('GET /epk/single/:epkId', () => {
    it('GET /epk/single/:epkId', async () => {
      let token;
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });
      
      return request(app.getHttpServer())
        .get('/epk/single/6429c96f608b52aa20750862')
        .set('Authorization', token)
        .expect(200)
    });

    // ! test fails with 203 error, should return 404 for epkId that does not exist
    it('GET /epk/single/:epkId with epkId that does not exist', async () => {
      let token;
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });
      
      return request(app.getHttpServer())
        .get('/epk/single/6429c96f608b52aa20750999')
        .set('Authorization', token)
        .expect(404)
    });
    // ! test fails with 500 error, should return 400 for invalid epkId
    it('GET /epk/single/:epkId with invalid epkId', async () => {
      let token;
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });

      return request(app.getHttpServer())
        .get('/epk/single/6429')
        .set('Authorization', token)
        .expect(400);
    });
  })

  describe('POST /epk/create-team', () => {
    // ! test fails with 400 error, should return 201
    it('POST /epk/create-team', async () => {
      let token;
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200) 
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        })

      const addMembers: AddMembersDto[] = [
        {
          email: `test${Math.floor(Math.random() * 1000)}@cineacloud.com`,
          name: "test1",
          createdBy: new mongo.ObjectId(),
          epkId: '6429c96f608b52aa20750862'
        }
      ]
      const inviteMembers: InviteMembersDto = {
        epkId: new mongo.ObjectId().toString(),
        addMembers: addMembers,
        removeMembers: []
      }
      
      return request(app.getHttpServer())
        .post('/epk/create-team')
        .set('Authorization', token)
        .send(inviteMembers)
        .expect(201)
    })
  })
});
