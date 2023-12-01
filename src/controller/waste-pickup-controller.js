const WastePickupModel = require('../models/waste-pickup-model');

// Display Organic Partners
const getOrganicPartners = async (req, res) => {
  try {
    const data = await WastePickupModel.showOrganicPartner();
    res.status(200).json({
      message: 'List of All Organic Partners',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display Non Organic Partners
const getNonOrganicPartners = async (req, res) => {
  try {
    const data = await WastePickupModel.showNonOrganicPartner();
    res.status(200).json({
      message: 'List of All Organic Partners',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};


module.exports = {
  getOrganicPartners,
  getNonOrganicPartners,
};
