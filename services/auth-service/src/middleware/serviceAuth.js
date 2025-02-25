/**
 * Middleware to authenticate service-to-service communication
 * Uses API keys for service authentication
 */
module.exports = (req, res, next) => {
    try {
        const apiKey = req.header('X-Service-API-Key');
        
        if (!apiKey) {
            return res.status(401).json({ message: 'Service API key is required' });
        }

        // Get allowed service API keys from environment
        const allowedKeys = (process.env.ALLOWED_SERVICE_API_KEYS || '').split(',');
        
        if (!allowedKeys.includes(apiKey)) {
            return res.status(401).json({ message: 'Invalid service API key' });
        }

        // Add service info to request
        req.service = {
            authenticated: true,
            // You could add more service-specific info here
        };

        next();
    } catch (error) {
        console.error('Service auth error:', error);
        res.status(401).json({ message: 'Service authentication failed' });
    }
};
