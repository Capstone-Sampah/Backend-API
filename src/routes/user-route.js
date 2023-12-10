const express = require('express');
const UserController = require('../controllers/user-controller');
const VerifyToken = require('../middleware/verify-token');
const router = express.Router();

// User registration
router.post('/register', UserController.register);

// User login
router.post('/login', UserController.login);

// Display user activity
router.get('/activity/:usersId', UserController.getUserActivity);

// Edit user profile
router.patch('/editprofile/:usersId', UserController.editProfile);

// Reset user password
router.patch('/resetpassword/:usersId',
    VerifyToken.accessValidation, UserController.resetPassword);

// Logout
router.delete('/logout', UserController.logout);

module.exports = router;
