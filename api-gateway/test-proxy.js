/**
 * Simple test script for API Gateway proxy functionality
 * This script creates a minimal Express server that proxies requests to the auth service
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Simple direct proxy to auth service
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 60000,
    timeout: 60000,
    onError: (err, req, res) => {
        console.error(`Proxy error: ${err.message}`);
        res.status(500).json({ 
            success: false,
            message: 'Service unavailable',
            error: err.message
        });
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'UP', 
        message: 'Test Gateway is running',
        timestamp: new Date().toISOString()
    });
});

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Test gateway running on port ${PORT}`);
    console.log(`✅ Proxying /api/auth to http://localhost:3000`);
    console.log(`✅ Try: http://localhost:${PORT}/health`);
    console.log(`✅ Try: http://localhost:${PORT}/api/auth/login (POST)`);
});
