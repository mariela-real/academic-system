import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('serves the welcome message', async () => {
    // arrange
    const appRequest = request(app.getHttpServer());

    // act
    const response = await appRequest.get('/');

    // assert
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  it('reports the API as available', async () => {
    // arrange
    const appRequest = request(app.getHttpServer());

    // act
    const response = await appRequest.get('/health');

    // assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  afterEach(async () => {
    await app.close();
  });
});
