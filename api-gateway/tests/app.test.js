/**
 * API Gateway Tests
 */

const request = require('supertest');
const app = require('../src/app');

describe('API Gateway', () => {
    // Health check endpoint
    describe('GET /health', () => {
        it('should return 200 OK with status UP', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('UP');
            expect(response.body.message).toBe('API Gateway is running');
        });
    });

    // API version endpoint
    describe('GET /api/version', () => {
        it('should return 200 OK with version info', async () => {
            const response = await request(app).get('/api/version');
            expect(response.status).toBe(200);
            expect(response.body.version).toBe('1.0.0');
            expect(response.body.name).toBe('GuardianCare API Gateway');
        });
    });

    // 404 Not Found
    describe('GET /non-existent-route', () => {
        it('should return 404 Not Found', async () => {
            const response = await request(app).get('/non-existent-route');
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    // Authentication required
    describe('GET /api/users', () => {
        it('should return 401 Unauthorized when no token is provided', async () => {
            const response = await request(app).get('/api/users');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
