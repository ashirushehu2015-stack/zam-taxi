const request = require('supertest');
const app = require('../../server');

describe('Auth Endpoints', () => {
  let uniqueEmail = 'test' + Date.now() + '@example.com';
  let token;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: uniqueEmail,
        password: 'password123',
        phone_number: '1234567890',
        role: 'passenger'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', uniqueEmail);
  });

  it('should login the registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
  });
});
