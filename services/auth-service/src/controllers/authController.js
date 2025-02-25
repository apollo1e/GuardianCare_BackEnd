const authService = require('../services/authService');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({
            message: 'User registered successfully',
            ...result
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(error.message === 'User already exists' ? 400 : 500)
           .json({ message: error.message || 'Error registering user' });
    }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json({
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(error.message === 'Invalid credentials' ? 401 : 500)
           .json({ message: error.message || 'Error logging in' });
    }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await authService.getUserProfile(req.user.userId);
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(error.message === 'User not found' ? 404 : 500)
           .json({ message: error.message || 'Error fetching profile' });
    }
};
