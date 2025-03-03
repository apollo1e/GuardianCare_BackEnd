/**
 * Error handling middleware for API Gateway
 */

const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Catches all errors thrown in the application and returns a standardized error response
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(`Error: ${err.message}`);
    logger.error(`Stack: ${err.stack}`);
    
    // Determine status code (default to 500)
    const statusCode = err.statusCode || 500;
    
    // Send standardized error response
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

/**
 * 404 Not Found handler
 * Handles requests to routes that don't exist
 */
const notFoundHandler = (req, res) => {
    logger.warn(`Route not found: ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
