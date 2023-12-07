const express = require('express');
const VoucherController = require('../controller/voucher-controller');
const router = express.Router();

// List all vouchers
router.get('/list', VoucherController.getVouchers);

module.exports = router;
