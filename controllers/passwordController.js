const User = require('../models/userModel');
const ForgotPasswordRequests = require('../models/forgotPasswordRequests');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_API_NAME, // Your Sendinblue SMTP login
        pass: process.env.EMAIL_API_KEY  // Your Sendinblue SMTP password
    }
});

const PasswordController = {
    forgotPassword: async (req, res) => {
        const { email } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const id = uuidv4();
            await ForgotPasswordRequests.create({ id, userId: user.id });

            const resetUrl = `http://localhost:5000/password/resetpassword/${id}`;
            const mailOptions = {
                from: process.env.VALIDATED_EMAIL, // Use the validated Gmail address
                to: email,
                subject: 'Password Reset',
                text: `Click the following link to reset your password: ${resetUrl}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Error sending email' });
                } else {
                    console.log('Email sent:', info.response);
                    return res.status(200).json({ message: 'Password reset email sent' });
                }
            });
        } catch (err) {
            console.error('Error processing forgot password:', err);
            res.status(500).json({ message: 'Error processing forgot password' });
        }
    },
    resetPassword: async (req, res) => {
        const { id } = req.params;
        const { newPassword } = req.body;

        try {
            const request = await ForgotPasswordRequests.findOne({ where: { id, isActive: true } });
            if (!request) {
                return res.status(400).json({ message: 'Invalid or expired password reset request' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.update({ password: hashedPassword }, { where: { id: request.userId } });
            await ForgotPasswordRequests.update({ isActive: false }, { where: { id } });

            res.status(200).json({ message: 'Password reset successful' });
        } catch (err) {
            console.error('Error resetting password:', err);
            res.status(500).json({ message: 'Error resetting password' });
        }
    }
};

module.exports = PasswordController;