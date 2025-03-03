/**
 * Proxy configuration utility for API Gateway
 * 
 * IMPORTANT: This file was updated to fix a timeout issue when calling APIs from port 8000.
 * The issue was that the proxy was using hardcoded localhost URLs instead of the URLs from
 * the config object, which are set from environment variables. Now it correctly uses the
 * service URLs from the config.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../../config/config');
const logger = require('./logger');

// Debug logging to verify target URLs
console.log('Creating proxies with these service URLs:');
console.log('AUTH_SERVICE_URL:', config.services.auth);
console.log('ELDERLY_SERVICE_URL:', config.services.elderly);

/**
 * Create a proxy middleware for a service
 * @param {string} target - The target URL for the proxy
 * @param {string} pathRewrite - The path to rewrite (optional)
 * @returns {Function} - The proxy middleware
 */
const createServiceProxy = (target, pathRewrite = null) => {
    console.log(`Creating proxy to target: ${target}`); // Debug log
    
const options = {
    target,
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 120000,
    timeout: 120000,
    ws: true,
    secure: false,
    xfwd: true,
    followRedirects: true,
    // Retry logic for failed connections
    retry: {
        attempts: 3,
        delay: 1000
    },
    // Keep connections alive
    agent: new require('http').Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 100
    }),
    // Handle WebSocket errors
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
        socket.on('error', (err) => {
            console.error('WebSocket Proxy Error:', err);
        });
    },
        onProxyReq: (proxyReq, req, res) => {
            // Log request attempt
            console.log(`Proxying request to: ${target}${req.url}`);
            logger.info(`Proxying request to: ${target}${req.url}`, {
                method: req.method,
                headers: proxyReq.getHeaders(),
                body: req.body
            });

            // Handle POST/PUT requests with body
            if ((req.method === 'POST' || req.method === 'PUT')) {
                if (req.body) {
                    const bodyData = JSON.stringify(req.body);
                    proxyReq.setHeader('Content-Type', 'application/json');
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                }
            }

            // Add custom headers
            proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
            proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
            proxyReq.setHeader('X-Forwarded-For', req.ip);
        },
        onProxyRes: (proxyRes, req, res) => {
            // Log successful proxy response
            console.log(`Proxy response from ${target}${req.url}: ${proxyRes.statusCode}`);
            logger.info(`Proxy response received`, {
                url: `${target}${req.url}`,
                status: proxyRes.statusCode,
                headers: proxyRes.headers
            });

            // Add CORS headers if needed
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        },
        onError: (err, req, res) => {
            // Log error details
            const errorDetails = {
                url: `${target}${req.url}`,
                method: req.method,
                error: err.message,
                code: err.code,
                target: target
            };
            console.error('Proxy Error:', JSON.stringify(errorDetails, null, 2));
            logger.error('Proxy Error:', errorDetails);

            // Attempt to retry if connection refused
            if (err.code === 'ECONNREFUSED' && options.retry.attempts > 0) {
                options.retry.attempts--;
                console.log(`Retrying connection to ${target}, attempts left: ${options.retry.attempts}`);
                setTimeout(() => {
                    const proxy = createProxyMiddleware(options);
                    proxy(req, res);
                }, options.retry.delay);
                return;
            }

            // Send error response if no more retries or different error
            if (!res.headersSent) {
                res.status(502).json({
                    success: false,
                    message: 'Service unavailable',
                    error: err.message,
                    code: err.code,
                    target: target
                });
            }
        }
    };

    // Add path rewrite if provided
    if (pathRewrite) {
        options.pathRewrite = pathRewrite;
    }

    return createProxyMiddleware(options);
};

// Proxy options using service URLs from config
const proxyOptions = {
    auth: createServiceProxy(config.services.auth, {
        '^/api/auth': '/api/auth'
    }),
    users: createServiceProxy(config.services.auth, {
        '^/api/users': '/api/users'
    }),
    elderly: createServiceProxy(config.services.elderly, {
        '^/api/elderly': '/api/elderly'
    }),
    // Updated path rewriting to be consistent with other services
    // Previously these were rewriting to '/' which might cause issues
    checkIn: createServiceProxy(config.services.checkIn, {
        '^/api/check-in': '/api/check-in'
    }),
    asr: createServiceProxy(config.services.asr, {
        '^/api/asr': '/api/asr'
    }),
    llm: createServiceProxy(config.services.llm, {
        '^/api/llm': '/api/llm'
    })
};

module.exports = {
    createServiceProxy,
    proxyOptions
};
