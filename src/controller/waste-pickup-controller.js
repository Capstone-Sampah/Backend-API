const WastePickupModel = require('../models/waste-pickup-model');

// Display partners
const getOrganicPartners = async (req, res) => {
  try {
    const data = await WastePickupModel.showOrganicPartner();
    res.status(200).json({
      message: 'List of organic partners',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

const getNonOrganicPartners = async (req, res) => {
  try {
    const data = await WastePickupModel.showNonOrganicPartner();
    res.status(200).json({
      message: 'List of non organic partners',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display waste type
const getOrganicWasteType = async (req, res) => {
  try {
    const data = await WastePickupModel.showOrganicWasteType();
    res.status(200).json({
      message: 'List of organic waste type',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

const getNonOrganicWasteType = async (req, res) => {
  try {
    const data = await WastePickupModel.showNonOrganicWasteType();
    res.status(200).json({
      message: 'List of non organic waste type',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};


// Check partner and waste type available or not
const checkPartnerExists = async (partnersId) => {
  try {
    const partner = await WastePickupModel.findPartnerById(partnersId);
    return !!partner;
  } catch (error) {
    throw (error);
  }
};

const checkWasteTypeExists = async (typeId) => {
  try {
    const wasteType = await WastePickupModel.findWasteTypeById(typeId);
    return !!wasteType;
  } catch (error) {
    throw (error);
  }
};

// Create waste pickup
const orderWastePickup = async (req, res) => {
  const {usersId} = req.params;
  const {
    partnersId,
    phoneNumber,
    province,
    subDistrict,
    village,
    postalCode,
    address,
    date,
    time,
    note,
    wasteItems,
  } = req.body;

  // Check condition
  if (!partnersId || !phoneNumber || !province || !subDistrict || !village ||
      !postalCode || !address || !date || !time || !note || !wasteItems
  ) {
    return res.status(400).json({
      message: 'Your entered data does not match what instructed in form',
    });
  }

  if (!Array.isArray(wasteItems)) {
    return res.status(400).json({
      message: 'Waste items should be provided as an array',
    });
  }

  if (wasteItems.length === 0) {
    return res.status(400).json({
      message: 'Waste items should include at least one items',
    });
  }

  if (!wasteItems.every((item) => item.typeId && item.quantity)) {
    return res.status(400).json({
      message: 'Each waste item must have both typeId and quantity properties',
    });
  }

  const checkPartner = await checkPartnerExists(partnersId);

  if (!checkPartner) {
    return res.status(400).json({
      message: 'Sorry, partner data not found',
    });
  }

  for (const items of wasteItems) {
    const checkTypeId = await checkWasteTypeExists(items.typeId);

    if (!checkTypeId) {
      return res.status(400).json({
        message: 'Sorry, one or more waste items have an invalid waste type',
      });
    }
  }

  const pickupData = {
    usersId,
    partnersId,
    phoneNumber,
    province,
    subDistrict,
    village,
    postalCode,
    address,
    date,
    time,
    note,
    totalPoints: 0,
    status: 'Dalam Antrian',
  };

  try {
    // Insert into waste pickup table
    const pickupId = await WastePickupModel.createWastePickup(pickupData);

    // Insert into waste items table
    const wasteItemsData = wasteItems.map(
        (item) => [pickupId, item.typeId, item.quantity],
    );

    await WastePickupModel.createWasteItems(wasteItemsData);

    // Estimate total points that users will receive
    const estimateTotalPoints = async (wasteItemsData) => {
      let totalPoints = 0;

      for (const item of wasteItemsData) {
        const [, typeId, quantity] = item;
        const wasteType = await WastePickupModel.findWasteTypeById(typeId);

        if (wasteType) {
          const pointKg = wasteType.pointKg;
          const totalKg = Math.floor(quantity / wasteType.totalKg);

          const itemPoint = pointKg * totalKg;
          totalPoints += itemPoint;
        }
      }
      return totalPoints;
    };

    const totalPoints = await estimateTotalPoints(wasteItemsData);

    res.status(201).json({
      message: 'Waste pickup order has been successfully received by partner',
      estimatePointsEarned: totalPoints,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display history waste pickup
const getPendingWastePickup = async (req, res) => {
  const {usersId} = req.params;
  try {
    const data = await WastePickupModel.showPendingWastePickup(usersId);
    return res.status(200).json({
      message: 'List of history waste pickup (Dalam Antrian)',
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

const getAcceptWastePickup = async (req, res) => {
  const {usersId} = req.params;
  try {
    const data = await WastePickupModel.showAcceptWastePickup(usersId);
    return res.status(200).json({
      message: 'List of history waste pickup (Sedang Diproses)',
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

const getDeclineWastePickup = async (req, res) => {
  const {usersId} = req.params;
  try {
    const data = await WastePickupModel.showDeclineWastePickup(usersId);
    return res.status(200).json({
      message: 'List of history waste pickup (Permintaan Ditolak)',
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
  getOrganicPartners,
  getNonOrganicPartners,
  getOrganicWasteType,
  getNonOrganicWasteType,
  orderWastePickup,
  getPendingWastePickup,
  getAcceptWastePickup,
  getDeclineWastePickup,
};
