const User = require('../models/userModel');

const LeaderboardController = {
    getLeaderboard: async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: ['name', 'total_expenses'],
                order: [['total_expenses', 'DESC']]
            });
            res.status(200).json(users);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            res.status(500).json({ message: 'Error fetching leaderboard' });
        }
    }
};

module.exports = LeaderboardController;