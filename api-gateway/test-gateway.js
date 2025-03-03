/**
 * Test script for API Gateway
 * 
 * This script creates a minimal Express server that proxies requests to the auth service
 * using the same proxy configuration as the main API Gateway.
 * 
 * Usage:
 * 1. Make sure the auth service is running on port 3000
 * 2. Run this script: node test-gateway.js
 * 3. Try accessing: http://localhost:8000/health
 * 4. Try accessing: http://localhost:8000/api/auth/login (POST)
 */

require('dotenv').config();
const express = require('express');
const { createServiceProxy } = require('./src/utils/proxy');
const config = require('./config/config');

const app = express();

// Log the service URLs from config
console.log('Service URLs from config:');
console.log('AUTH_SERVICE_URL:', config.services.auth);
console.log('ELDERLY_SERVICE_URL:', config.services.elderly);
console.log('CHECK_IN_SERVICE_URL:', config.services.checkIn);
console.log('ASR_SERVICE_URL:', config.services.asr);
console.log('LLM_SERVICE_URL:', config.services.llm);

// Create proxy to auth service using config URL
const authProxy = createServiceProxy(config.services.auth, {
    '^/api/auth': '/api/auth'
});

// Use the proxy for auth routes
app.use('/api/auth', authProxy);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'UP', 
        message: 'Test Gateway is running',
        timestamp: new Date().toISOString(),
        config: {
            authServiceUrl: config.services.auth
        }
    });
});

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Test gateway running on port ${PORT}`);
    console.log(`✅ Proxying /api/auth to ${config.services.auth}`);
    console.log(`✅ Try: http://localhost:${PORT}/health`);
    console.log(`✅ Try: http://localhost:${PORT}/api/auth/login (POST)`);
});
