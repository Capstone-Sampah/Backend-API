const uid = require('uid-safe');
const VoucherModel = require('../models/voucher-model');

// Display vouchers
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

// Create voucher redeem
const redeemVoucher = async (req, res) => {
  const {usersId} = req.params;
  const {vouchersId} = req.body;

  // Check condition 1
  if (!vouchersId) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  try {
    const user = await VoucherModel.findUserById(usersId);
    const voucher = await VoucherModel.findVoucherById(vouchersId);

    // Check condition 2
    if (!user.length) {
      return res.status(400).json({
        message: 'Sorry, user data not found',
      });
    }

    if (!voucher.length) {
      return res.status(400).json({
        message: 'Sorry, voucher data not found',
      });
    }

    const userPoint = user[0].point;
    const voucherPoint = voucher[0].point;
    const voucherTotal = voucher[0].total;

    if (userPoint >= voucherPoint && voucherTotal > 0) {
      // Reduce user point
      await VoucherModel.setUserPoint(usersId, userPoint, voucherPoint);

      // Reduce voucher toal
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

      // Create receipt redeem voucher
      const receiptId = await VoucherModel.createVoucherReceipt(
          usersId,
          vouchersId,
          voucherToken,
      );

      // Display user voucher receipt
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

module.exports = {
  getVouchers,
  redeemVoucher,
};
