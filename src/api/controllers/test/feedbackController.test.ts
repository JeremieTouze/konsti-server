import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { startServer, closeServer } from 'server/server';

let server;
let mongoServer;
let mongoUri;

beforeEach(async () => {
  mongoServer = new MongoMemoryServer();
  mongoUri = await mongoServer.getConnectionString();
  server = await startServer(mongoUri);
});

afterEach(async () => {
  await closeServer(server, mongoUri);
  await mongoServer.stop();
});

describe('POST /api/feedback', () => {
  test('should return 401 without valid authorization', async () => {
    const response = await request(server).post('/api/feedback');
    expect(response.status).toEqual(401);
  });
});
