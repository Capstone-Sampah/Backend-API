const VoucherModel = require('../models/voucher-model');

// Display voucher
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

module.exports = {
  getVouchers,
};
