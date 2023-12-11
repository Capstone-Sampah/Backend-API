const express = require('express');
const VoucherController = require('../controllers/voucher-controller');
const router = express.Router();

// Display list of vouchers
router.get('/list', VoucherController.getVouchers);

// Perform voucher redemption
router.post('/users/:usersId/redeem', VoucherController.redeemVoucher);

// List all voucher receipts
router.get('/users/:usersId/list/receipts',
    VoucherController.getVoucherReceipts);

module.exports = router;
