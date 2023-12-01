const express = require('express');
const router = express.Router();
const WastePickupController = require('../controller/waste-pickup-controller');

// List of Organic Partners
router.get('/organicpartner', WastePickupController.getOrganicPartners);

// List of Non Organic Partners
router.get('/nonorganicpartner', WastePickupController.getNonOrganicPartners);

module.exports = router;
