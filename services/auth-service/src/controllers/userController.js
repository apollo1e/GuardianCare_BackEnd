const authService = require('../services/authService');
const userService = require('../services/userService');

/**
 * Get user by ID - Internal Service API
 * @route GET /api/users/:userId
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.userId);
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(error.message === 'User not found' ? 404 : 500)
           .json({ message: error.message || 'Error fetching user' });
    }
};

/**
 * Get users by type - Internal Service API
 * @route GET /api/users/type/:userType
 */
exports.getUsersByType = async (req, res) => {
    try {
        const users = await userService.getUsersByType(req.params.userType);
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: error.message || 'Error fetching users' });
    }
};

/**
 * Get users by IDs - Internal Service API
 * @route POST /api/users/batch
 */
exports.getUsersByIds = async (req, res) => {
    try {
        const { userIds } = req.body;
        const users = await userService.getUsersByIds(userIds);
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: error.message || 'Error fetching users' });
    }
};
