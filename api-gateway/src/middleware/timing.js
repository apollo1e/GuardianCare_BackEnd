/**
 * Request timing middleware for API Gateway
 * Tracks and logs the time taken for each request
 */

const logger = require('../utils/logger');

const requestTiming = (req, res, next) => {
    // Start timing
    const start = Date.now();
    
    // Store start time on request object
    req.startTime = start;
    
    // Log initial request
    logger.info(`Request started: ${req.method} ${req.originalUrl}`);

    // Function to log timing on response finish
    const logTiming = () => {
        const duration = Date.now() - start;
        logger.info({
            message: `Request completed: ${req.method} ${req.originalUrl}`,
            duration: `${duration}ms`,
            status: res.statusCode,
            service: req.originalUrl.split('/')[2] // Extract service name from URL
        });

        // Log warning if request takes too long
        if (duration > 5000) {
            logger.warn({
                message: 'Slow request detected',
                duration: `${duration}ms`,
                url: req.originalUrl,
                method: req.method
            });
        }
    };

    // Log timing when response is finished
    res.on('finish', logTiming);
    
    next();
};

module.exports = requestTiming;
