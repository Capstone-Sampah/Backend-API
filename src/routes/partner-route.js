const express = require('express');
const PartnerController = require('../controller/partner-controller');
const router = express.Router();

// Login
router.post('/login', PartnerController.login);

module.exports = router;
