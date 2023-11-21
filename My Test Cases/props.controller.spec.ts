import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PropsController } from './props.controller';
import { AppModule } from '../app.module';
import { mongo } from 'mongoose';

describe('PropsController', () => {
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

  describe('POST /props/create', () => {
    it('POST /props/create', async () => {
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
        .post('/props/create')
        .set('Authorization', `${token}`)
        .send({
          image: ['61bffd1f3d77041f707c61c5', '61cbf84106073633e026f278'],
          item: 'camera-7',
          sceneNumber: 1,
          sceneHeading: 'Dead',
          shootDate: '11/09/2021',
          notes: 'Heloo F***',
          cast: 'Arif',
          approved: true,
          acquired: false,
          projectId: new mongo.ObjectId(),
        })
        .expect(200)
        .then((res) => {
          console.log('look here for post /props/create', res);
        });
    });

    // ! test fails with a 500 internal server error, it should return a 401 unauthorized if no token is provided
    it('POST /props/create no token', async () => {
      return request(app.getHttpServer())
        .post('/props/create')
        .send({
          image: ['61bffd1f3d77041f707c61c5', '61cbf84106073633e026f278'],
          item: 'camera-7',
          sceneNumber: 1,
          sceneHeading: 'Dead',
          shootDate: '11/09/2021',
          notes: 'Heloo F***',
          cast: 'Arif',
          approved: true,
          acquired: false,
          projectId: new mongo.ObjectId(),
        })
        .expect(401)
        .then((res) => {
          console.log('look here for post /props/create', res);
        });
    });
  });

describe('PUT /props/update', () => {
    it('PUT /props/update', async () => {
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

      await request(app.getHttpServer())
        .post('/props/create')
        .set('Authorization', `${token}`)
        .send({
          image: ['61bffd1f3d77041f707c61c5', '61cbf84106073633e026f278'],
          item: 'camera-7',
          sceneNumber: 1,
          sceneHeading: 'Dead',
          shootDate: '11/09/2021',
          notes: 'Heloo F***',
          cast: 'Arif',
          approved: true,
          acquired: false,
          projectId: '642a35fa67354f1cbfd14386',
        })
        .expect(200);

      return request(app.getHttpServer())
        .post('/props/update')
        .set('Authorization', `${token}`)
        .send({
          propsId: '61bffe31ae30834e5411c2f4',
          image: ['61bffd1f3d77041f707c61c5'],
          item: 'camera-1',
          sceneNumber: 1,
          sceneHeading: 'Dead',
          cast: 'Firnaas',
          approved: true,
          acquired: false,
          projectId: '642a35fa67354f1cbfd14386',
        })
        .expect(200)
        .then((res) => {
          console.log('look here for post /props/update', res);
        });
    });

  describe('GET /props', () => {
    it('GET /props', async () => {
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
        .post('/props?limit=10&page=1&offset=5&sort=cast&type=desc')
        .set('Authorization', `${token}`)
        .expect(200)
        .then((res) => {
          console.log(
            'look here for post /props?limit=10&page=1&offset=5&sort=cast&type=desc',
            res,
          );
        });
    });

    it('GET /props no token', async () => {
      return request(app.getHttpServer())
        .post('/props?limit=10&page=1&offset=5&sort=cast&type=desc')
        .expect(401)
        .then((res) => {
          console.log('look here for post /props', res);
        });
    });
  });

  describe('GET /props', () => {
    it('GET /props', async () => {
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
        .post('/props/642b8d281bb699709bc9aee3')
        .set('Authorization', `${token}`)
        .expect(200)
        .then((res) => {
          console.log(
            'look here for post /props/61cd5939c2cb725bc0fc8976',
            res,
          );
        });
    });

    it('GET /props no token', async () => {
      return request(app.getHttpServer())
        .post('/props/61cd5939c2cb725bc0fc8976')
        .expect(401)
        .then((res) => {
          console.log('look here for post /props', res);
        });
    });
  });

  describe('DEL /props/remove/61c00265fc68e11c1873f92d', () => {
    it('DEL /props/remove/61c00265fc68e11c1873f92d', async () => {
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
        .post('/props/remove/61c00265fc68e11c1873f92d')
        .set('Authorization', `${token}`)
        .expect(200)
        .then((res) => {
          console.log(
            'look here for post /props/remove/61c00265fc68e11c1873f92d',
            res,
          );
        });
    });

    it('DEL /props no token', async () => {
      return request(app.getHttpServer())
        .post('/props/remove/61c00265fc68e11c1873f92d')
        .expect(401)
        .then((res) => {
          console.log('look here for post /props', res);
        });
    });
  });

  describe('POST /props/invite', () => {
    it('POST /props/invite', async () => {
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
        .post('/props/invite')
        .set('Authorization', `${token}`)
        .send({
          propId: '61cd5939c2cb725bc0fc8976',
          addMembers: [
            { name: 'Arif', email: 'arif@cineacloud.com' },
            { name: 'Mansoor', email: 'mansoor.osman@cineacloud.com' },
          ],
          removeMembers: [],
        })
        .expect(200)
        .then((res) => {
          console.log('look here for post /props/invite', res);
        });
    });

    it('POST /props/invite no token', async () => {
      return request(app.getHttpServer())
        .post('/props/invite')
        .send({
          propId: '61cd5939c2cb725bc0fc8976',
          addMembers: [
            { name: 'Arif', email: 'arif@cineacloud.com' },
            { name: 'Mansoor', email: 'mansoor.osman@cineacloud.com' },
          ],
          removeMembers: [],
        })
        .expect(401)
        .then((res) => {
          console.log('look here for post /props/invite', res);
        });
    });
  });

  describe('GET /props/list-members/61cd5939c2cb725bc0fc8976', () => {
    it('GET /props/list-members/61cd5939c2cb725bc0fc8976', async () => {
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
        .post('/props/remove/61c00265fc68e11c1873f92d')
        .set('Authorization', `${token}`)
        .expect(200)
        .then((res) => {
          console.log(
            'look here for post /props/remove/61c00265fc68e11c1873f92d',
            res,
          );
        });
    });

    it('GET /props/list-members/61cd5939c2cb725bc0fc8976 no token', async () => {
      return request(app.getHttpServer())
        .post('/props/list-members/61cd5939c2cb725bc0fc8976')
        .expect(401)
        .then((res) => {
          console.log('look here for post /props', res);
        });
    });
  });

  describe('POST /props/remove-many', () => {
    it('POST /props/remove-many', async () => {
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
        .post('/props/remove-many')
        .set('Authorization', `${token}`)
        .send({
          deleteIds: ['61bffd1f3d77041f707c61c5', '61cbf84106073633e026f278'],
        })
        .expect(200)
        .then((res) => {
          console.log('look here for post /props/invite', res);
        });
    });

    it('POST /props/remove-many no token', async () => {
      return request(app.getHttpServer())
        .post('/props/remove-many')
        .send({
          deleteIds: ['61bffd1f3d77041f707c61c5', '61cbf84106073633e026f278'],
        })
        .expect(401)
        .then((res) => {
          console.log('look here for post /props/invite', res);
        });
    });
  });
});
});
