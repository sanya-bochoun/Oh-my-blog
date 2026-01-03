import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.mjs';
import { query } from '../utils/db.mjs';

describe('Authentication API', () => {
  let testUserId;
  let testUserEmail;
  let testUserToken;

  beforeAll(async () => {
    // Clean up any existing test users
    testUserEmail = `test${Date.now()}@example.com`;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await query('DELETE FROM refresh_tokens WHERE user_id = $1', [testUserId]);
      await query('DELETE FROM verification_tokens WHERE user_id = $1', [testUserId]);
      await query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: `testuser${Date.now()}`,
        email: testUserEmail,
        password: 'Test1234!',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);

      testUserId = response.body.data.user.id;
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        username: `testuser${Date.now()}`,
        email: 'invalid-email',
        password: 'Test1234!',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'weak',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        username: `testuser${Date.now()}`,
        email: testUserEmail, // Use existing email
        password: 'Test1234!',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'Test1234!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(loginData.email);

      testUserToken = response.body.data.accessToken;
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test1234!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      if (!testUserToken) {
        // Login first if token not available
        const loginData = {
          email: testUserEmail,
          password: 'Test1234!'
        };
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send(loginData);
        testUserToken = loginResponse.body.data.accessToken;
      }

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUserEmail);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });
});

