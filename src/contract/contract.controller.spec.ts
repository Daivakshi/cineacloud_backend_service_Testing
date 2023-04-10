import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { CreateFormDto } from './dtos/create-form.dto';
import { mongo } from 'mongoose';
import { DiscordContractDto } from './dtos/discord-contract.dto';


describe('ContractController', () => {
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
  
  // ! test fails with a 500 error
  // ! this route is GET request to create a contract it should be POST
  describe('GET /create', () => {
    it('GET /create', async () => {
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
      
      const projectId = '6427bcf63366cd5e582a8c9f';
      // ! this route is GET request to create a contract it should be POST
      await request(app.getHttpServer())
        .get(`/contract/create?projectId=${projectId}`)
        .set('Authorization', token)
        .expect(200)
        .then((res) => {
          expect(res.body.message).toBe('contract created successfully');
          expect(res.body.data).toBeDefined();
        });
    });

    it('GET /create with missing auth token', async () => {
      const projectId = '6427bcf63366cd5e582a8c9f';
      await request(app.getHttpServer())
        .get(`/contract/create?projectId=${projectId}`)
        .expect(401)
    });

    it('GET /create with missing projectId', async () => {
      await request(app.getHttpServer())
        .get(`/contract/create`)
        .expect(400)
        .then((res) => {
          // ! probably should rename project_id property to projectId in the response message
          expect(res.body.message).toBe('Please provide project_id');
        })
    });
  });

  describe('GET /:id', () => {
    // ! test fails with a 500 error
    it('GET /:id', async () => {
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

      const id = '6427bcf63366cd5e582a8c9f';
      return await request(app.getHttpServer())
        .get(`/contract/${id}`)
        .set('Authorization', `${token}`)
        .expect(200)
        .then((res) => {
          // ! probably should update the response message to contract fetched successfully
          expect(res.body.message).toBe('contract fetched successfully');
          expect(res.body.data).toBeDefined();
        });
    });

    // ! test fails with a 500 error
    it('GET /:id with missing auth token', async () => {
       const id = '6427bcf63366cd5e582a8c9f';
       return await request(app.getHttpServer())
         .get(`/contract/${id}`)
         .expect(401);
    });

    it('GET /:id with missing id', async () => {
      await request(app.getHttpServer())
        .get(`/contract/`)
        .expect(404)
        .then((res) => {
          expect(res.body.message).toBe('Not Found');
        })
    });

    it('GET /:id with invalid id', async () => {
      await request(app.getHttpServer())
        .get(`/contract/invalid_id`)
        .expect(400)
    });
  });

  describe('POST /render-form', () => {
    it('POST /render-form', async () => {
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

      const updateContract: CreateFormDto = {
        contractId: new mongo.ObjectId('64285dd2d96bdc77b3c65cbc'),
        formData: null,
      };

      return await request(app.getHttpServer())
        .post('/contract/render-form')
        .set('Authorization', `${token}`)
        .send(updateContract)
        .expect(200);
    });

    // ! test fails with a 500 error
    it('POST /render-form with missing auth token', async () => {
      const updateContract: CreateFormDto = {
        contractId: new mongo.ObjectId('64285dd2d96bdc77b3c65cbc'),
        formData: null,
      };

      return await request(app.getHttpServer())
        .post('/contract/render-form')
        .send(updateContract)
        .expect(401);
    });

    // ! test fails with a 500 error
    it('POST /render-form with missing contractId', async () => {
      const updateContract: CreateFormDto = {
        contractId: null,
        formData: null,
      };

      return await request(app.getHttpServer())
        .post('/contract/render-form')
        .send(updateContract)
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBe('Please provide contractId');
        });
    }); 
  })

  describe('POST /discord-contract', () => {
    it('POST /discord-contract', async () => {
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
      
      const discordContract: DiscordContractDto = {
        contractId: new mongo.ObjectId('64285dd2d96bdc77b3c65cbc'),
      }

      return await request(app.getHttpServer())
        .post('/contract/discord-contract')
        .set('Authorization', `${token}`)
        .send(discordContract)
        .expect(200)
        .then((res) => {
          expect(res.body.message).toBe(
            'Contract has been removed successfully',
          );
        });
    });

    // ! test fails with a 500 error should return 401
    it('POST /discord-contract with missing auth token', async () => {
      const discordContract: DiscordContractDto = {
        contractId: new mongo.ObjectId('64285dd2d96bdc77b3c65cbc'),
      };

      return await request(app.getHttpServer())
        .post('/contract/discord-contract')
        .send(discordContract)
        .expect(401)
    });
  });

  describe('GET /view/:contractId', () => {
    it('GET /view/:contractId', async () => {
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
      
      const contractId = '6429c35f79019f9c7f11b53c';

      return await request(app.getHttpServer()).get(
        `/contract/view/${contractId}`,
      )
      .set('Authorization', `${token}`)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toBe('View contract fetched successfully');
      });
    })

    // ! test fails with a 500 error should return 401
    it('GET /view/:contractId with missing auth token', async () => {
      const contractId = '6429c35f79019f9c7f11b53c';
      return await request(app.getHttpServer())
        .get(`/contract/view/${contractId}`)
        .expect(401)
    });

    // ! test fails with a 500 error should return 404
    it('GET /view/:contractId with missing contractId', async () => {
      return await request(app.getHttpServer())
        .get(`/contract/view/`)
        .expect(404)
    });
  });

  // ! this route should be a /GET request instead of a /POST request, nothing is created
  describe('POST /all', () => {
    it('POST /all', async () => {
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
        
        return await request(app.getHttpServer())
          .post('/contract/all?projectId=6427bcf63366cd5e582a8c9f')
          .set('Authorization', `${token}`)
          .expect(200);

    })
  })
});
