import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { mongo } from 'mongoose';

describe('CommentsController', () => {
  let controller: CommentsController;
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

  describe('POST /comment/create', () => {
    it('POST /comment/create', async () => {
      let token;

      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });

      // i think this should fail because app id does not exist in db, so need to put it in fist somehow.
      return request(app.getHttpServer())
        .post('/comment/create')
        .set('Authorization', `${token}`)
        .send({
          appId: new mongo.ObjectId('642a076e022097ea36ca2ae0'),
          screenId: new mongo.ObjectId('642b821f7ee1a3635b03aca8'),
          comment: 'Hi Firnaas',
          type: 'props',
        })
        .expect(200)
    });

    it('POST /comment/create without token', async () => {
      return request(app.getHttpServer())
        .post('/comment/create')
        .send({
          appId: new mongo.ObjectId('642a076e022097ea36ca2ae0'),
          screenId: new mongo.ObjectId('642b821f7ee1a3635b03aca8'),
          comment: 'Hi Firnaas',
          type: 'props',
        })
        .expect(401);
    });
  });

  describe('GET /comments/:id', () => {
    it('GET /comment', async () => {
      let token;

      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });

      // i think this should fail because comment does not exist in db, so need to put it in fist somehow.
      return request(app.getHttpServer())
        .get(
          `/comments/642b7df0dd3fb2cc91954a0c?appId=642a076e022097ea36ca2ae0&type=props`,
        )
        .set('Authorization', `${token}`)
        .expect(200)
    });

    it('GET /comments/:id with no appId', async () => {
      let token;

      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });

      // i think this should fail because comment does not exist in db, so need to put it in fist somehow.
      // it should fail because no appId passed in query
      return request(app.getHttpServer())
        .get(`/comments/642b7df0dd3fb2cc91954a0c?type=props`)
        .set('Authorization', `${token}`)
        .expect(400)
    });

    it('GET /comments/:id with no type', async () => {
      let token;

      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .then((res) => {
          token = res.body.data.token;
          expect(token).toBeDefined();
        });

      // i think this should fail because comment does not exist in db, so need to put it in fist somehow.
      // it should fail because no type passed in query
      return request(app.getHttpServer())
        .get(`/comments/642b7df0dd3fb2cc91954a0c?appId=642a076e022097ea36ca2ae0`)
        .set('Authorization', `${token}`)
        .expect(400)
    });
  });
});
