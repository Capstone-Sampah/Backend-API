const express = require('express');
const WasteRecycleController = require(
    '../controllers/waste-recycle-controller',
);
const router = express.Router();

// Display list of video links for waste management
router.get('/videos/list/', WasteRecycleController.getRecycleLinks);

// Display recommendation video links for waste management based on type
router.post('/videos/recommendation',
    WasteRecycleController.getRecycleLinksByType);

module.exports = router;
