/**
 * API Gateway Routes
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { proxyOptions } = require('../utils/proxy');
const logger = require('../utils/logger');
const { notFoundHandler } = require('../middleware/errorHandler');

/**
 * Register all routes for the API Gateway
 * @param {express.Application} app - Express application
 */
const registerRoutes = (app) => {
    // Health check endpoint
    app.get('/health', (req, res) => {
        logger.info('Health check request received');
        res.status(200).json({ 
            status: 'UP', 
            message: 'API Gateway is running',
            timestamp: new Date().toISOString()
        });
    });

    // API version endpoint
    app.get('/api/version', (req, res) => {
        res.status(200).json({ 
            version: '1.0.0',
            name: 'GuardianCare API Gateway'
        });
    });

    // Proxy routes
    // Auth service routes (no authentication required)
    app.use('/api/auth', proxyOptions.auth);

    // User routes (authentication required)
    app.use('/api/users', authenticateToken, proxyOptions.users);

    // Elderly management routes (authentication required)
    app.use('/api/elderly', authenticateToken, proxyOptions.elderly);

    // Check-in service routes (authentication required)
    app.use('/api/check-in', authenticateToken, proxyOptions.checkIn);

    // ASR service routes (authentication required)
    app.use('/api/asr', authenticateToken, proxyOptions.asr);

    // LLM service routes (authentication required)
    app.use('/api/llm', authenticateToken, proxyOptions.llm);

    // 404 handler - must be registered last
    app.use(notFoundHandler);

    logger.info('All routes registered successfully');
};

module.exports = {
    registerRoutes
};
