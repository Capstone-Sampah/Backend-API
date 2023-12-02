const express = require('express');
const router = express.Router();
const WastePickupController = require('../controller/waste-pickup-controller');

// List of organic partners
router.get('/organicpartner', WastePickupController.getOrganicPartners);

// List of non-organic partners
router.get('/nonorganicpartner', WastePickupController.getNonOrganicPartners);

// List of organic waste type
router.get('/organictypes', WastePickupController.getOrganicWasteType);

// List of non-organic waste type
router.get('/nonorganictypes', WastePickupController.getNonOrganicWasteType);

// Order waste pickup
router.post('/order/:usersId', WastePickupController.orderWastePickup);

module.exports = router;
