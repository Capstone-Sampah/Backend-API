const express = require('express');
const UserController = require('../controllers/user-controller');
const VerifyToken = require('../middleware/verify-token');
const router = express.Router();

// User registration
router.post('/register', UserController.register);

// User login
router.post('/login', UserController.login);

// Display user activity
router.get('/:usersId/activity', UserController.getUserActivity);

// Edit user profile
router.patch('/:usersId/editprofile', UserController.editProfile);

// Reset user password
router.patch('/:usersId/resetpassword',
    VerifyToken.accessValidation, UserController.resetPassword);

// Logout
router.delete('/logout', UserController.logout);

module.exports = router;
