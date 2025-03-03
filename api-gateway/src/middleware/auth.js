/**
 * Authentication middleware for API Gateway
 */

const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token from the Authorization header and adds the decoded user to the request
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        logger.warn(`Authentication attempt without token: ${req.originalUrl}`);
        return res.status(401).json({ 
            success: false,
            message: 'Authentication token required' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, config.security.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error(`Authentication error: ${error.message}`);
        return res.status(403).json({ 
            success: false,
            message: 'Invalid or expired token' 
        });
    }
};

module.exports = {
    authenticateToken
};
