const elderlyService = require('../services/elderlyService');

/**
 * Assign elderly to caretaker
 * @route POST /api/elderly/assign
 */
exports.assignCaretaker = async (req, res) => {
    try {
        const { elderlyId, caretakerId } = req.body;
        
        if (!elderlyId || !caretakerId) {
            return res.status(400).json({ message: 'elderlyId and caretakerId are required' });
        }

        const result = await elderlyService.assignCaretaker(elderlyId, caretakerId);
        res.json(result);
    } catch (error) {
        console.error('Assign caretaker error:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * Remove caretaker assignment
 * @route POST /api/elderly/remove-caretaker
 */
exports.removeCaretaker = async (req, res) => {
    try {
        const { elderlyId } = req.body;
        
        if (!elderlyId) {
            return res.status(400).json({ message: 'elderlyId is required' });
        }

        const result = await elderlyService.removeCaretaker(elderlyId);
        res.json(result);
    } catch (error) {
        console.error('Remove caretaker error:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * Get all elderly assigned to a caretaker
 * @route GET /api/elderly/caretaker/:caretakerId
 */
exports.getCaretakerElderly = async (req, res) => {
    try {
        const elderly = await elderlyService.getCaretakerElderly(req.params.caretakerId);
        res.json(elderly);
    } catch (error) {
        console.error('Get caretaker elderly error:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * Get elderly's caretaker details
 * @route GET /api/elderly/:elderlyId/caretaker
 */
exports.getElderlyCaretaker = async (req, res) => {
    try {
        const caretaker = await elderlyService.getElderlyCaretaker(req.params.elderlyId);
        res.json(caretaker);
    } catch (error) {
        console.error('Get elderly caretaker error:', error);
        res.status(400).json({ message: error.message });
    }
};
