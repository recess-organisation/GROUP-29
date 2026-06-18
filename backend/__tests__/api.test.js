const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Point dotenv to test env if it exists
process.env.DB_NAME = 'learnhub_test';
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.NODE_ENV = 'test';

const app = require('../server');

describe('GET /', () => {
  it('returns API running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('UG Scholar');
  });
});

describe('POST /api/auth/register', () => {
  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ full_name: 'Test', email: 'not-an-email', password: '123456', role: 'student' });

    expect(res.statusCode).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ full_name: 'Test', email: 'test@test.com', password: '12', role: 'student' });

    expect(res.statusCode).toBe(400);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('rejects empty body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
  });
});
