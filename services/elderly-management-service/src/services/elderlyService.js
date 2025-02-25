const authClient = require('./authServiceClient');

class ElderlyService {
    /**
     * Assign elderly to caretaker
     */
    async assignCaretaker(elderlyId, caretakerId) {
        try {
            // Verify both users exist and have correct roles
            const [elderly, caretaker] = await Promise.all([
                authClient.getUserById(elderlyId),
                authClient.getUserById(caretakerId)
            ]);

            if (elderly.user_type !== 'elderly') {
                throw new Error('Specified user is not an elderly');
            }

            if (caretaker.user_type !== 'caretaker') {
                throw new Error('Specified user is not a caretaker');
            }

            // Update elderly's caretaker_id through auth service
            await authClient.updateUser(elderlyId, { caretaker_id: caretakerId });

            return { message: 'Caretaker assigned successfully' };
        } catch (error) {
            throw new Error(`Failed to assign caretaker: ${error.message}`);
        }
    }

    /**
     * Remove caretaker assignment
     */
    async removeCaretaker(elderlyId) {
        try {
            const elderly = await authClient.getUserById(elderlyId);
            
            if (elderly.user_type !== 'elderly') {
                throw new Error('Specified user is not an elderly');
            }

            // Remove caretaker assignment
            await authClient.updateUser(elderlyId, { caretaker_id: null });

            return { message: 'Caretaker removed successfully' };
        } catch (error) {
            throw new Error(`Failed to remove caretaker: ${error.message}`);
        }
    }

    /**
     * Get all elderly assigned to a caretaker
     */
    async getCaretakerElderly(caretakerId) {
        try {
            const caretaker = await authClient.getUserById(caretakerId);
            
            if (caretaker.user_type !== 'caretaker') {
                throw new Error('Specified user is not a caretaker');
            }

            return await authClient.getElderlyForCaretaker(caretakerId);
        } catch (error) {
            throw new Error(`Failed to get caretaker's elderly: ${error.message}`);
        }
    }

    /**
     * Get elderly's caretaker details
     */
    async getElderlyCaretaker(elderlyId) {
        try {
            const elderly = await authClient.getUserById(elderlyId);
            
            if (elderly.user_type !== 'elderly') {
                throw new Error('Specified user is not an elderly');
            }

            if (!elderly.caretaker_id) {
                return null;
            }

            return await authClient.getUserById(elderly.caretaker_id);
        } catch (error) {
            throw new Error(`Failed to get elderly's caretaker: ${error.message}`);
        }
    }
}

module.exports = new ElderlyService();
