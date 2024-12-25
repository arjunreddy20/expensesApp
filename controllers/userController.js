const User = require('../models/userModel');

const UserController = {
    getUserDetails: async (req, res) => {
        try {
            const user = await User.findOne({ where: { id: req.userId } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (err) {
            console.error('Error fetching user details:', err);
            res.status(500).json({ message: 'Error fetching user details' });
        }
    }
};


module.exports = UserController;