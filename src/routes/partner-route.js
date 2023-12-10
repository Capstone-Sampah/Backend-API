const express = require('express');
const PartnerController = require('../controllers/partner-controller');
const VerifyToken = require('../middleware/verify-token');
const router = express.Router();

// Partner login
router.post('/login', PartnerController.login);

// Display list order for waste pickup
router.get('/:partnersId/list/orders', PartnerController.getOrderWastePickup);

// Display list decline for waste pickup
router.get('/:partnersId/list/decline',
    PartnerController.getDeclineWastePickup);

// Accept user order for waste pickup
router.patch('/:partnersId/accept', PartnerController.setAcceptWastePickup);

// Decline user order for waste pickup
router.patch('/:partnersId/decline', PartnerController.setDeclineWastePickup);

// Edit partner profile
router.patch('/:partnersId/editprofile', PartnerController.editProfile);

// Reset partner password
router.patch('/:partnersId/resetpassword',
    VerifyToken.accessValidation, PartnerController.resetPassword);

// Logout
router.delete('/logout', PartnerController.logout);

module.exports = router;
