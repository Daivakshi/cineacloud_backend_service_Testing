import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { mongo } from 'mongoose';

describe('MediasController', () => {
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

  describe('POST /media/upload', () => {
    // ! test fails
    it('POST /media/upload', async () => {
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
      
      const file = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId('642394decdde5d28079f5cc5'),
        contractId: new mongo.ObjectId('6429c311effd1e9bd9591a45'),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0,
      };
      
      return request(app.getHttpServer())
        .post('/media/upload')
        .set('Authorization', token)
        .send({
          file: file
        })
        .expect(201)
    });
  })

  describe('POST /media/upload/docs', () => {
    // ! test fails
    it('POST /media/upload/docs', async () => {
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

      const file = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId('642394decdde5d28079f5cc5'),
        contractId: new mongo.ObjectId('6429c311effd1e9bd9591a45'),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0,
      };

      return request(app.getHttpServer())
        .post('/media/upload')
        .set('Authorization', token)
        .send({
          file: file,
          contractId: file.contractId
        })
        .expect(201);
    });
  });


  describe('POST /media/upload/all', () => {
    // ! test fails
    it('POST /media/upload/all', async () => {
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

      const file = {
        fileName: 'test',
        mimeType: 'test',
        key: 'test',
        userId: new mongo.ObjectId('642394decdde5d28079f5cc5'),
        contractId: new mongo.ObjectId('6429c311effd1e9bd9591a45'),
        fileId: 'test',
        sequence: 1,
        type: 'test',
        conversionStatus: false,
        status: 0,
      };

      return request(app.getHttpServer())
        .post('/media/upload')
        .set('Authorization', token)
        .send({
          files: [file, file],
        })
        .expect(201);
    });
  });

  describe('POST /media/delete', () => {
    it('POST /media/delete', async () => {
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
        .post('/media/upload')
        .set('Authorization', token)
        .send({
          fileId: ''
        })
        .expect(200);
    });
  })

  describe('GET /media/all', () => {
    it('GET /media/all', async () => {
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
        .get('/media/all')
        .set('Authorization', token)
        .expect(200)
    })
  })
});
