const express = require('express');
const UserController = require('../controller/user-controller');
const VerifyToken = require('../middleware/verify-token');
const router = express.Router();

// Register
router.post('/register', UserController.register);

// Login
router.post('/login', UserController.login);

// List of all users
router.get('/list', VerifyToken.accessValidation, UserController.getUsers);

module.exports = router;
