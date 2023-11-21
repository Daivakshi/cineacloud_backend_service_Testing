import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS)

describe('UsersController', () => {
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

  // Test for correct login
  describe('POST /login', () => {
    it('POST /login', async () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'daivakshi@gmail.com',
          password: 'password',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Logged in successfully');
          expect(res.body.data.token).toBeDefined();
        });
      });

      it('POST /login with wrong password', async () => {
        return request(app.getHttpServer())
          .post('/users/login')
          .send({
            email: 'daivakshi@gmail.com',
            password: 'pass',
          })
          .expect(400);
      });
  
      it('POST /login with wrong email', async () => {
        return request(app.getHttpServer())
          .post('/users/login')
          .send({
            email: 'tes@cineacloud.com',
            password: 'password',
          })
          .expect(400);
      });  

  });

  // Test for correct user profile
  describe('GET /profile', () => {
    it('GET /profile', async () => {
      let token;
      // use this in each test for signing in and saving the token to make requests to protected endpoints
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
        .get('/users/profile')
        .set('Authorization', `${token}`)
        .expect(200)
    });

    // ! test fails with a 500 internal server error, it should return a 401 unauthorized if no token is provided
    it('GET /profile without token', async () => {
      return request(app.getHttpServer()).get('/users/profile').expect(401);
    });

  });
/*
  // test create project
   describe('POST /createProject', () => {
    it('POST /createProject', async () => {
      let token;
      // use this in each test for signing in and saving the token to make requests to protected endpoints
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
        .post('/users/projects')
        .set('Authorization', `${token}`)
        .send({
          projName: "Enter some new project name",
        })
        //.expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Project created successfully');
        });
    })
  }) */

  // ! test fails with a 200 status code, it should return a 201 created status code
  describe('POST /projects', () => {
    it('POST /projects', async () => {
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
        });

      return request(app.getHttpServer())
        .post('/users/projects')
        .set('Authorization', `${token}`)
        .send({
          projName: 'Example Proj',
        })
        .expect(201);
    });
  });


  // test get projects
  describe('GET /Projects', () => {
    it('GET /Projects', async () => {
      let token;
      // use this in each test for signing in and saving the token to make requests to protected endpoints
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
      .get('/users/projects')
      .set('Authorization', `${token}`)
      .expect((res) => {
        expect(res.body.message).toBe('User Projects');
      });
  })

  // ! test fails with a 500 internal server error, it should return a 401 unauthorized if no token is provided
  it('GET /projects without token', async () => {
    return request(app.getHttpServer()).get('/users/projects').expect(401);
  });

})

describe('GET /projects/:id', () => {
  it('GET /projects/:id', async () => {
    let token;

    await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: '',
        password: '',
      })
      .expect(200)
      .then((res) => {
        token = res.body.data.token;
        expect(token).toBeDefined();
      });

    return request(app.getHttpServer())
      .get('/users/projects/642a35fa67354f1cbfd14386')
      .set('Authorization', `${token}`)
      .expect(200);
  });
});

// ! tests pass but I would assume that for extend-session
// ! it would require a token to be passed in the header for authentication
  describe('GET /extend-session', () => {
    it('GET /extend-session', async () => {
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

      await request(app.getHttpServer())
        .get('/users/extend-session?email=daivakshi@gmail.com')
        .expect(200)
        .then((res) => {
          expect(res.body.message).toBe('Login session extended successfully');
          expect(res.body.data.authKey).toBeTruthy();
        });
    });
  });


  // ! tests pass but I would assume that for adding a premium user you would need to be an admin
  // ! test fails with expected 201 "Created", got 400 "Bad Request"
  // ! or be authed with a token to be passed in the header for authentication
  describe('POST /add-premium-user', () => {
    it(' POST /add-premium-user', async () => {
      await request(app.getHttpServer())
        .post('/users/add-premium-user')
        .send({
          email: 'fake@cineacloud.com'
        })
        .expect(201)
    });

    it(' POST /add-premium-user with existing email', async () => {
      await request(app.getHttpServer())
        .post('/users/add-premium-user')
        .send({
          email: 'daivakshi@gmail.com'
        })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBe('User already exsist. Please check with the admin');
        })
    });
  });
  
});
