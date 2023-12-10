const WastePickupModel = require('../models/waste-pickup-model');

// Display list of organic partners
const getOrganicPartners = async (req, res) => {
  try {
    const data = await WastePickupModel.showOrganicPartners();
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

// Display list of non-organic partners
const getNonOrganicPartners = async (req, res) => {
  try {
    const data = await WastePickupModel.showNonOrganicPartners();
    res.status(200).json({
      message: 'List of non-organic partners',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display list of organic waste types
const getOrganicWasteTypes = async (req, res) => {
  try {
    const data = await WastePickupModel.showOrganicWasteTypes();
    res.status(200).json({
      message: 'List of organic waste types',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display list of non-organic waste types
const getNonOrganicWasteTypes = async (req, res) => {
  try {
    const data = await WastePickupModel.showNonOrganicWasteTypes();
    res.status(200).json({
      message: 'List of non-organic waste types',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Create waste pickup order
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
  const user = await WastePickupModel.findUserById(usersId);

  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  if (!partnersId || !phoneNumber || !province || !subDistrict || !village ||
      !postalCode || !address || !date || !time || !note || !wasteItems
  ) {
    return res.status(400).json({
      message: 'Your entered data does not match what instructed in form',
    });
  }

  const partner = await WastePickupModel.findPartnerById(partnersId);

  if (!partner.length) {
    return res.status(404).json({
      message: 'Sorry, partner data not found',
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

  for (const items of wasteItems) {
    const wasteType = await WastePickupModel.findWasteTypeById(items.typeId);

    if (!wasteType) {
      return res.status(404).json({
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

          if (wasteType.totalKg === 2 && quantity >= 2) {
            // Waste type ('Sisa-sisa makanan')
            const itemPoint = pointKg * totalKg;
            totalPoints += itemPoint;
          } else if (wasteType.totalKg === 1 && quantity >= 1) {
            const itemPoint = pointKg * quantity;
            totalPoints += itemPoint;
          }
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

// Display list of history waste pickup with status 'Dalam Antrian'
const getPendingWastePickup = async (req, res) => {
  const {usersId} = req.params;

  // Check condition
  const user = await WastePickupModel.findUserById(usersId);

  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  try {
    const orders = await WastePickupModel.showPendingWastePickup(usersId);
    const detailOrders = await Promise.all(
        orders.map(async (item) => {
          const wasteItems = await
          WastePickupModel.showOrderWasteItems(item.id);
          return {
            pickupId: item.id,
            status: item.status,
            partner: item.partner,
            category: item.category,
            phoneNumber: item.phoneNumber,
            province: item.province,
            subDistrict: item.subDistrict,
            village: item.village,
            postalCode: item.postalCode,
            address: item.address,
            date: item.date,
            time: item.time,
            note: item.note,
            timeAgo: item.timeAgo,
            wasteItems: wasteItems,
          };
        }),
    );
    return res.status(200).json({
      message: 'List of history waste pickup (Dalam Antrian)',
      data: detailOrders,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display list of history waste pickup with status 'Sedang Diproses'
const getAcceptWastePickup = async (req, res) => {
  const {usersId} = req.params;

  // Check condition
  const user = await WastePickupModel.findUserById(usersId);

  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  try {
    const orders = await WastePickupModel.showAcceptWastePickup(usersId);
    const detailOrders = await Promise.all(
        orders.map(async (item) => {
          const wasteItems = await
          WastePickupModel.showOrderWasteItems(item.id);
          return {
            pickupId: item.id,
            status: item.status,
            partner: item.partner,
            category: item.category,
            phoneNumber: item.phoneNumber,
            province: item.province,
            subDistrict: item.subDistrict,
            village: item.village,
            postalCode: item.postalCode,
            address: item.address,
            date: item.date,
            time: item.time,
            note: item.note,
            timeAgo: item.timeAgo,
            wasteItems: wasteItems,
          };
        }),
    );
    return res.status(200).json({
      message: 'List of history waste pickup (Sedang Diproses)',
      data: detailOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display list of history waste pickup with status 'Permintaan Ditolak'
const getDeclineWastePickup = async (req, res) => {
  const {usersId} = req.params;

  // Check condition
  const user = await WastePickupModel.findUserById(usersId);

  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  try {
    const orders = await WastePickupModel.showDeclineWastePickup(usersId);
    const detailOrders = await Promise.all(
        orders.map(async (item) => {
          const wasteItems = await
          WastePickupModel.showOrderWasteItems(item.id);
          return {
            pickupId: item.id,
            status: item.status,
            partner: item.partner,
            category: item.category,
            phoneNumber: item.phoneNumber,
            province: item.province,
            subDistrict: item.subDistrict,
            village: item.village,
            postalCode: item.postalCode,
            address: item.address,
            date: item.date,
            time: item.time,
            note: item.note,
            timeAgo: item.timeAgo,
            wasteItems: wasteItems,
          };
        }),
    );
    return res.status(200).json({
      message: 'List of history waste pickup (Permintaan Ditolak)',
      data: detailOrders,
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
  getOrganicWasteTypes,
  getNonOrganicWasteTypes,
  orderWastePickup,
  getPendingWastePickup,
  getAcceptWastePickup,
  getDeclineWastePickup,
};
