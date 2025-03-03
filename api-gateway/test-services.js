/**
 * Test script to verify connectivity to each service
 * This script tests each service endpoint directly and through the API gateway
 */

const axios = require('axios');
const config = require('./config/config');

// Get auth token
async function getAuthToken() {
    try {
        // Try to login with test credentials
        console.log('Attempting to login with test credentials...');
        const loginUrl = `${config.services.auth}/api/auth/login`;
        console.log('Login URL:', loginUrl);

        const response = await axios.post(loginUrl, {
            email: 'caretaker@example.com',
            password: 'password123'
        }, {
            timeout: 10000, // Increase timeout for auth
            validateStatus: function (status) {
                return status < 500; // Accept all responses except 500+ errors
            }
        });

        if (response.status === 200 && response.data && response.data.token) {
            return response.data.token;
        } else {
            console.error('Login failed:', {
                status: response.status,
                data: response.data
            });
            return null;
        }
    } catch (error) {
        console.error('Failed to get auth token:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
            console.error('Status:', error.response.status);
        }
        return null;
    }
}

// Test a single service
async function testService(name, directUrl, gatewayUrl, authToken = null, method = 'GET', data = null) {
    console.log(`\nTesting ${name}...`);

    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    const config = {
        timeout: 10000, // Increase timeout to avoid gateway timeouts
        headers,
        validateStatus: function (status) {
            // Consider any status less than 500 as a valid test result
            // This helps us see the actual error responses instead of axios errors
            return status < 500;
        }
    };

    try {
        // Test direct connection
        console.log(`Testing direct connection to ${directUrl} [${method}]`);
        console.log('Request config:', {
            headers: config.headers,
            method,
            data: data || 'No data'
        });
        
        const directStart = Date.now();
        const directResponse = method === 'GET'
            ? await axios.get(directUrl, config)
            : await axios.post(directUrl, data, config);

        console.log(`✅ Direct connection successful (${Date.now() - directStart}ms)`);
        console.log('Response status:', directResponse.status);
        console.log('Response headers:', directResponse.headers);
        console.log('Response data:', directResponse.data);
    } catch (error) {
        console.error(`❌ Direct connection failed:`, error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Response:', error.response.data);
        }
        if (error.request) {
            console.error('Request was made but no response received');
            console.error('Request:', error.request);
        }
    }

    // Add delay between direct and gateway tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Test through gateway
        console.log(`\nTesting through gateway ${gatewayUrl} [${method}]`);
        console.log('Gateway request config:', {
            headers: config.headers,
            method,
            data: data || 'No data'
        });

        const gatewayStart = Date.now();
        const gatewayResponse = method === 'GET'
            ? await axios.get(gatewayUrl, config)
            : await axios.post(gatewayUrl, data, config);

        console.log(`✅ Gateway connection successful (${Date.now() - gatewayStart}ms)`);
        console.log('Response status:', gatewayResponse.status);
        console.log('Response headers:', gatewayResponse.headers);
        console.log('Response data:', gatewayResponse.data);
    } catch (error) {
        console.error(`❌ Gateway connection failed:`, error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Response:', error.response.data);
        }
        if (error.request) {
            console.error('Request was made but no response received');
            console.error('Request:', error.request);
        }
    }
}

// Test all services
async function testAllServices() {
    const gatewayUrl = `http://localhost:${config.server.port}`;

    // Test API Gateway health endpoint first
    try {
        console.log('\nTesting API Gateway...');
        const response = await axios.get(`${gatewayUrl}/health`, { timeout: 5000 });
        console.log('✅ API Gateway is running');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('❌ API Gateway test failed:', error.message);
        console.error('Make sure the API Gateway is running on port', config.server.port);
        return;
    }

    // Get auth token first
    console.log('\nGetting auth token...');
    const authToken = await getAuthToken();
    if (!authToken) {
        console.error('❌ Failed to get auth token. Some tests may fail.');
    } else {
        console.log('✅ Successfully obtained auth token');
    }

    // Define services with their test endpoints
    const services = [
        {
            name: 'Auth Service',
            url: config.services.auth,
            gatewayPath: '/api/auth',
            endpoint: '/status', // Use status endpoint instead of health
            requiresAuth: false
        },
        {
            name: 'Elderly Service',
            url: config.services.elderly,
            gatewayPath: '/api/elderly',
            endpoint: '/api/elderly', // Test the main elderly endpoint
            requiresAuth: true
        },
        {
            name: 'Check-in Service',
            url: config.services.checkIn,
            gatewayPath: '/api/check-in',
            endpoint: '/api/check-in/status',
            requiresAuth: true
        },
        {
            name: 'ASR Service',
            url: config.services.asr,
            gatewayPath: '/api/asr',
            endpoint: '/api/asr/status',
            requiresAuth: true
        },
        {
            name: 'LLM Service',
            url: config.services.llm,
            gatewayPath: '/api/llm',
            endpoint: '/api/llm/status',
            requiresAuth: true
        }
    ];

    // Only test services that are running
    const runningServices = services.filter(service => {
        const isRunning = [
            'Auth Service',
            'Elderly Service'
        ].includes(service.name);

        if (!isRunning) {
            console.log(`\nSkipping ${service.name} (not running)`);
        }
        return isRunning;
    });

    // Test each running service
    for (const service of runningServices) {
        let endpoint = service.endpoint;
        let testUrl = service.url;
        let method = 'GET';
        let testData = null;

        // Special handling for each service
        if (service.name === 'Auth Service') {
            // Test user registration
            endpoint = '/register';
            method = 'POST';
            testData = {
                email: `test${Date.now()}@example.com`,
                password: 'Test123!',
                name: 'Test User',
                user_type: 'caretaker',
                phone: '1234567890'
            };

            // Test direct service first
            await testService(
                service.name,
                `${testUrl}/api/auth${endpoint}`,
                `${gatewayUrl}/api/auth${endpoint}`,
                null, // No auth needed for register
                method,
                testData
            );

            // Wait before testing protected endpoint
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Then test auth profile endpoint
            endpoint = '/profile';
            method = 'GET';
            testData = null;

            await testService(
                service.name,
                `${testUrl}/api/auth${endpoint}`,
                `${gatewayUrl}/api/auth${endpoint}`,
                authToken,
                method,
                testData
            );

        } else if (service.name === 'Elderly Service') {
            endpoint = '/'; // Test root elderly endpoint first
            method = 'GET';

            await testService(
                service.name,
                `${testUrl}/api/elderly${endpoint}`,
                `${gatewayUrl}/api/elderly${endpoint}`,
                authToken,
                method,
                testData
            );

            // Wait before testing list endpoint
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Then test list endpoint
            endpoint = '/list';
            await testService(
                service.name,
                `${testUrl}/api/elderly${endpoint}`,
                `${gatewayUrl}/api/elderly${endpoint}`,
                authToken,
                method,
                testData
            );
        }
    }
}

// Run tests
console.log('Starting service connectivity tests...');
console.log('API Gateway URL:', `http://localhost:${config.server.port}`);
console.log('Service URLs from config:', config.services);

testAllServices().catch(error => {
    console.error('Test script error:', error.message);
});
