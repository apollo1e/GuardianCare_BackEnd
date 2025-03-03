/**
 * API Gateway Configuration
 */

module.exports = {
    // Server configuration
    server: {
        port: process.env.API_GATEWAY_PORT || 8000,
        env: process.env.NODE_ENV || 'development',
    },
    
    // Service URLs
    services: {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
        elderly: process.env.ELDERLY_SERVICE_URL || 'http://localhost:3001',
        checkIn: process.env.CHECK_IN_SERVICE_URL || 'http://localhost:5000',
        asr: process.env.ASR_SERVICE_URL || 'http://localhost:5001',
        llm: process.env.LLM_SERVICE_URL || 'http://localhost:5002',
    },
    
    // Security configuration
    security: {
        jwtSecret: process.env.JWT_SECRET,
        rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100, // limit each IP to 100 requests per windowMs
    },
    
    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
    },
    
    // CORS configuration
    cors: {
        origin: '*', // Allow all origins in development
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
};
