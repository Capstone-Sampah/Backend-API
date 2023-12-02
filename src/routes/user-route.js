const express = require('express');
const UserController = require('../controller/user-controller');
const VerifyToken = require('../middleware/verify-token');
const router = express.Router();

// Register
router.post('/register', UserController.register);

// Register with Google
router.get('/auth/google', UserController.authGoogle);
router.get('/auth/google/callback', UserController.callbackGoogle);

// Login
router.post('/login', UserController.login);

// Forgot password
router.patch('/setpassword/:usersId', UserController.setPassword);

// List of all users
router.get('/list', VerifyToken.accessValidation, UserController.getUsers);

module.exports = router;
