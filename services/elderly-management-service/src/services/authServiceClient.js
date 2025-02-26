const axios = require('axios');

class AuthServiceClient {
    constructor() {
        this.baseURL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
        
        this.client = axios.create({
            baseURL: this.baseURL
        });
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            const response = await this.client.get(`/api/users/${userId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('User not found');
            }
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    /**
     * Get users by type (elderly or caretaker)
     */
    async getUsersByType(userType) {
        try {
            const response = await this.client.get(`/api/users/type/${userType}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    /**
     * Get multiple users by their IDs
     */
    async getUsersByIds(userIds) {
        try {
            const response = await this.client.post('/api/users/batch', { userIds });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    /**
     * Get all elderly users for a caretaker
     */
    async getElderlyForCaretaker(caretakerId) {
        try {
            const elderly = await this.getUsersByType('elderly');
            return elderly.filter(user => user.caretaker_id?.toString() === caretakerId);
        } catch (error) {
            throw new Error(`Error fetching elderly users: ${error.message}`);
        }
    }

    /**
     * Update user details
     */
    async updateUser(userId, updateData) {
        try {
            const response = await this.client.put(`/api/users/${userId}`, updateData);
            return response.data;
        } catch (error) {
            throw new Error(`Error updating user: ${error.response?.data?.message || error.message}`);
        }
    }
    
}

// Export singleton instance
module.exports = new AuthServiceClient();
