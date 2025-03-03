// Load environment variables first
require('./config/env');

// Debug logging to verify environment variables
console.log('AUTH_SERVICE_URL from env:', process.env.AUTH_SERVICE_URL);
console.log('Config services.auth:', require('../config/config').services.auth);

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { authenticateToken } = require('./middleware/auth');
const config = require('../config/config');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// ✅ Middleware
// Body parsing middleware - IMPORTANT: Must come before proxy routes
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        // Store raw body for proxy middleware
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));

// Add raw body parsing for proxy requests
app.use((req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        req.rawBody = data;
        next();
    });
});
app.use(cors(config.cors));
app.use(helmet()); // Security headers
app.use(morgan('combined', { stream: logger.stream })); // Detailed HTTP request logging

// Add request timing middleware early
const requestTiming = require('./middleware/timing');
app.use(requestTiming);

// Add error handling for JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        logger.error('JSON Parse Error:', err);
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload',
            error: err.message
        });
    }
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        message: 'API Gateway is running',
        timestamp: new Date().toISOString(),
        services: {
            auth: config.services.auth,
            elderly: config.services.elderly,
            checkIn: config.services.checkIn,
            asr: config.services.asr,
            llm: config.services.llm
        }
    });
});

// Log configuration on startup
logger.info('API Gateway Configuration:', {
    environment: config.server.env,
    port: config.server.port,
    services: {
        auth: config.services.auth,
        elderly: config.services.elderly,
        checkIn: config.services.checkIn,
        asr: config.services.asr,
        llm: config.services.llm
    }
});

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(apiLimiter);

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GuardianCare API',
            version: '1.0.0',
            description: 'API Documentation for GuardianCare Backend',
        },
        servers: [
            {
                url: `http://localhost:${config.server.port}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import and register routes
const { registerRoutes } = require('./routes');

// Debug proxy setup
console.log('Setting up proxy routes with these service URLs:');
Object.entries(config.services).forEach(([service, url]) => {
    console.log(`${service.toUpperCase()}_SERVICE_URL:`, url);
});

// Register all routes
registerRoutes(app);

// Debug route registration
app._router.stack.forEach(r => {
    if (r.route && r.route.path) {
        console.log('Route:', r.route.path);
    } else if (r.name === 'router') {
        console.log('Router middleware:', r.regexp);
    }
});

// Import error handling middleware
const { errorHandler } = require('./middleware/errorHandler');

// ✅ Error handling middleware
app.use(errorHandler);

// ✅ Start Server
const PORT = config.server.port;
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`✅ API Gateway running on port ${PORT}`);
    console.log(`✅ API Gateway running on port ${PORT}`);
    console.log(`✅ Android app can connect to this single endpoint for all services`);
});

module.exports = app; // For testing
