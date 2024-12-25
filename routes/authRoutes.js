const express = require('express');
const AuthController = require('../controllers/authController');
const PasswordController = require('../controllers/passwordController');

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/password/forgotpassword', PasswordController.forgotPassword);
router.post('/password/resetpassword/:id', PasswordController.resetPassword);


module.exports = router;