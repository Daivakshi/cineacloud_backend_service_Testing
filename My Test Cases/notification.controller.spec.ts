import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';

describe('NotificationController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/GET listAllNotifications', () => {
    it('/GET listAllNotifications', async () => {
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

      return request(app.getHttpServer())
        .get('/notification/listAllNotifications')
        .set('Authorization', token)
        .expect(200)
    });

    // ! this test fails with a 500 error, should return 401
    it('GET /listAllNotifications without token', async () => {
      return request(app.getHttpServer())
        .get('/notification/listAllNotifications')
        .expect(401)
    })
  });

  describe('/GET update', () => {
    it('/GET update', async () => {
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
        })

      return request(app.getHttpServer())
        .get('/notification/update')
        .set('Authorization', token)
        .expect(200)
    });

    // ! this test fails with a 500 error, should return 401
    it('GET /update without token', async () => {
      return request(app.getHttpServer())
        .get('/notification/update')
        .expect(401)
    })
  });
});

