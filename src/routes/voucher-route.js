const express = require('express');
const VoucherController = require('../controllers/voucher-controller');
const router = express.Router();

// List all vouchers
router.get('/list', VoucherController.getVouchers);

// Create redeem voucher
router.post('/redeem/:usersId', VoucherController.redeemVoucher);

module.exports = router;
