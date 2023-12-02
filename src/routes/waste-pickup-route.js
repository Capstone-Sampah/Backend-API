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

// List of history waste pickup ('Dalam Antrian')
router.get('/history/:usersId/pending',
    WastePickupController.getPendingWastePickup);


// List of history waste pickup ('Sedang Diproses')
router.get('/history/:usersId/accept',
    WastePickupController.getAcceptWastePickup);

// List of history waste pickup ('Permintaan Ditolak')
router.get('/history/:usersId/decline',
    WastePickupController.getDeclineWastePickup);

module.exports = router;
