const express = require('express');
const PartnerController = require('../controller/partner-controller');
const VerifyToken = require('../middleware/verify-token');
const router = express.Router();

// Login
router.post('/login', PartnerController.login);

// Display incoming user waste pickup
router.get('/:partnersId/orders', PartnerController.getOrderWastePickup);

// Decline waste pickup request from user
router.patch('/:partnersId/decline', PartnerController.setDeclineWastePickup);

// Accept waste pickup request from user
router.patch('/:partnersId/accept', PartnerController.setAcceptWastePickup);

// Display decline user waste pickup
router.get('/:partnersId/orders/decline',
    PartnerController.getDeclineWastePickup);

// Forgot password
router.patch('/setpassword/:partnersId',
    VerifyToken.accessValidation, PartnerController.setPassword);

// Logout
router.delete('/logout', VerifyToken.accessValidation,
    PartnerController.logout);

module.exports = router;
