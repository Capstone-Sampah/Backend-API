const express = require('express');
const UserController = require('../controller/user-controller');
const router = express.Router();

// Register
router.post('/register', UserController.register);

// Login
router.post('/login', UserController.login);

module.exports = router;
