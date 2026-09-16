import request from 'supertest';
import app from '../app';

describe('Google Authentication & User Identity API Tests', () => {
  const testGoogleUser = {
    email: 'testuser@example.com',
    name: 'Test Student',
    picture: 'https://lh3.googleusercontent.com/a/mock-photo',
    googleId: 'google_oauth2_1029384756',
  };

  let authToken: string;
  let userId: string;

  it('POST /api/v1/auth/google registers or authenticates a Google user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send(testGoogleUser);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testGoogleUser.email);
    expect(res.body.user.name).toBe(testGoogleUser.name);
    expect(res.body.user.hasCompletedOnboarding).toBe(false);

    authToken = res.body.token;
    userId = res.body.user.id;
  });

  it('POST /api/v1/auth/google rejects invalid payload without email or name', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        picture: 'https://example.com/pic.png',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/google is idempotent and returns existing user with new token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        ...testGoogleUser,
        name: 'Test Student Updated',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.id).toBe(userId);
    expect(res.body.token).toBeDefined();
  });

  it('GET /api/v1/auth/me returns current user with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testGoogleUser.email);
    expect(res.body.user.id).toBe(userId);
  });

  it('GET /api/v1/auth/me rejects requests without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/auth/onboarding-status updates user completion status', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/onboarding-status')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ hasCompletedOnboarding: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hasCompletedOnboarding).toBe(true);
  });
});
