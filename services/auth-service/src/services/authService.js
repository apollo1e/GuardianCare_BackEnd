const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
    /**
     * Register a new user
     */
    async registerUser(userData) {
        const { password, ...otherData } = userData;

        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            ...otherData,
            password_hash
        });

        // Generate token
        const token = this.generateToken(user);

        return {
            token,
            user: this.sanitizeUser(user)
        };
    }

    /**
     * Login user
     */
    async loginUser(email, password) {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = this.generateToken(user);

        return {
            token,
            user: this.sanitizeUser(user)
        };
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        const user = await User.findById(userId).select('-password_hash');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    /**
     * Generate JWT token
     */
    generateToken(user) {
        return jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                user_type: user.user_type 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
    }

    /**
     * Remove sensitive data from user object
     */
    sanitizeUser(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            user_type: user.user_type
        };
    }
}

module.exports = new AuthService();
