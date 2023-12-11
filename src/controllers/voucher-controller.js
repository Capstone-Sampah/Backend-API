const uid = require('uid-safe');
const VoucherModel = require('../models/voucher-model');

// Display list of vouchers
const getVouchers = async (req, res) => {
  try {
    const data = await VoucherModel.showVoucher();
    const filterData = data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      point: item.point,
      status: item.status,
      createdAt: item.createdAt,
    }));
    return res.status(200).json({
      message: 'List of vouchers',
      data: filterData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Perform voucher redemption
const redeemVoucher = async (req, res) => {
  const {usersId} = req.params;
  const {vouchersId} = req.body;

  // Check condition
  const user = await VoucherModel.findUserById(usersId);

  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  if (!vouchersId) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  const voucher = await VoucherModel.findVoucherById(vouchersId);

  if (!voucher.length) {
    return res.status(404).json({
      message: 'Sorry, voucher data not found',
    });
  }

  try {
    const userPoint = user[0].point;
    const voucherPoint = voucher[0].point;
    const voucherTotal = voucher[0].total;

    if (userPoint >= voucherPoint && voucherTotal > 0) {
      // Reduce user point
      await VoucherModel.setUserPoint(usersId, userPoint, voucherPoint);

      // Reduce voucher total
      const newVoucherTotal = voucherTotal - 1;
      const newVoucherStatus = newVoucherTotal === 0 ?
                            'Habis' : voucher[0].status;

      await VoucherModel.setVoucherTotal(
          vouchersId,
          newVoucherTotal,
          newVoucherStatus,
      );

      // Generate exchange voucher token
      const voucherToken = await new Promise((resolve, reject) => {
        uid(10, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      // Create voucher receipt
      const receiptId = await VoucherModel.createVoucherReceipt(
          usersId,
          vouchersId,
          voucherToken,
      );

      // Display voucher receipt just now
      const data = await VoucherModel.showNewVoucherReceipt(receiptId);

      return res.status(201).json({
        message: 'Congratulations, redeemption voucher was successfull',
        data: data,
      });
    } else {
      return res.status(400).json({
        message: 'Insufficient points to redeem voucher or out of stock',
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display list of voucher receipts owned by user
const getVoucherReceipts = async (req, res) => {
  const {usersId} = req.params;

  // Check condition
  const user = await VoucherModel.findUserById(usersId);

  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  try {
    const data = await VoucherModel.showVoucherReceipt(usersId);

    return res.status(200).json({
      message: 'List of voucher receipts',
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

module.exports = {
  getVouchers,
  redeemVoucher,
  getVoucherReceipts,
};
