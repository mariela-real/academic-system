import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  const appController = new AppController(new AppService());

  it('returns the service welcome message', () => {
    // arrange

    // act
    const response = appController.getHello();

    // assert
    expect(response).toBe('Hello World!');
  });

  it('reports the API as available', () => {
    // arrange

    // act
    const response = appController.getHealth();

    // assert
    expect(response).toEqual({ status: 'ok' });
  });
});
