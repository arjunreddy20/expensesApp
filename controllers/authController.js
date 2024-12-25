const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const AuthController = {
    signup: async (req, res) => {
        const { name, email, password } = req.body;

        try {
            // Check if the email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email id already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Create the user in the database
            await User.create({ name, email, password: hashedPassword });
            res.status(201).send('User created successfully');
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error creating user' });
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user.id }, process.env.PRIVATE_KEY);
            res.status(200).json({ token, message: 'Login successful' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error logging in' });
        }
    },
};

module.exports = AuthController;