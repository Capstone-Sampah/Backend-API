const WasteRecycleModel = require('../models/waste-recycle-model');

// Display list of video links for waste management
const getRecycleLinks = async (req, res) => {
  try {
    const data = await WasteRecycleModel.showRecycleLinks();
    return res.status(200).json({
      message: 'List of video links for waste management',
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display recommendation video links for waste management based on type
const getRecycleLinksByType = async (req, res) => {
  const {wasteType} = req.body;

  // Check condition 1
  if (!wasteType) {
    return res.status(400).json({
      message: 'You entered data does not match what instructed in form',
    });
  }

  try {
    // Check condition 2
    const data = await WasteRecycleModel.showRecycleLinksByType(wasteType);

    if (!data.length) {
      return res.status(404).json({
        message: 'Sorry, no recommendation video links for that waste type yet',
      });
    }

    return res.status(200).json({
      message: 'List video links of waste management for that waste type',
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
  getRecycleLinks,
  getRecycleLinksByType,
};
