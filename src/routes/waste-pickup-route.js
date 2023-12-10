const express = require('express');
const router = express.Router();
const WastePickupController = require('../controllers/waste-pickup-controller');

// Display list of organic partners
router.get('/list/partners/organic', WastePickupController.getOrganicPartners);

// Display list of non-organic partners
router.get('/list/partners/nonorganic',
    WastePickupController.getNonOrganicPartners);

// Display list of organic waste types
router.get('/list/types/organic', WastePickupController.getOrganicWasteTypes);

// Display list of non-organic waste types
router.get('/list/types/nonorganic',
    WastePickupController.getNonOrganicWasteTypes);

// Create waste pickup order
router.post('/users/:usersId/order', WastePickupController.orderWastePickup);

// Display list of history waste pickup with status 'Dalam Antrian'
router.get('/users/:usersId/history/pending',
    WastePickupController.getPendingWastePickup);

// Display list of history waste pickup with status 'Sedang Diproses'
router.get('/users/:usersId/history/accept',
    WastePickupController.getAcceptWastePickup);

// Display list of history waste pickup with status 'Permintaan Ditolak'
router.get('/users/:usersId/history/decline',
    WastePickupController.getDeclineWastePickup);

module.exports = router;
