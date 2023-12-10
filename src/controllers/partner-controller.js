const jwt = require('jsonwebtoken');
const PartnerModel = require('../models/partner-model');
const WastePickupModel = require('../models/waste-pickup-model');
const {blacklistedTokens} = require('../middleware/verify-token');

// Partner login
const login = async (req, res) => {
  const {body} = req;

  // Check condition 1
  if (!body.email || !body.password) {
    return res.status(400).json({
      message: 'You entered data does not match what instructed in form',
    });
  }

  try {
    // Find partner
    const data = await PartnerModel.authPartner(body);

    // Check condition 2
    if (data === 'Partner data not found') {
      return res.status(404).json({
        message: 'Sorry, partner data not found',
      });
    } else if ( data === 'Incorrect password') {
      return res.status(401).json({
        message: 'The password you entered is incorrect. Please try again !!',
      });
    } else {
      const filterData = data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        email: item.email,
        phoneNumber: item.phoneNumber,
        province: item.province,
        subDistrict: item.subDistrict,
        village: item.village,
        postalCode: item.postalCode,
        createdAt: item.createdAt,
      }));

      // JSON Web Token (JWT)
      const payload = {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        category: data[0].category,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      res.status(200).json({
        message: 'You have successfully login in your account',
        data: filterData,
        token: token,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display list order for waste pickup
const getOrderWastePickup = async (req, res) => {
  const {partnersId} = req.params;

  // Check condition
  const partner = await PartnerModel.findPartnerById(partnersId);

  if (!partner.length) {
    return res.status(404).json({
      message: 'Sorry, partner data not found',
    });
  }

  try {
    const orders = await PartnerModel.showOrderWastePickup(partnersId);
    const detailOrders = await Promise.all(
        orders.map(async (item) => {
          // Display list name and quantity of waste items
          const wasteItems = await PartnerModel.showWasteItems(item.id);
          const filterWasteItems = await Promise.all(
              wasteItems.map(async (item) => {
                return {
                  name: item.name,
                  quantity: item.quantity,
                };
              }),
          );
          return {
            pickupId: item.id,
            status: item.status,
            name: item.name,
            phoneNumber: item.phoneNumber,
            province: item.province,
            subDistrict: item.subDistrict,
            village: item.village,
            postalCode: item.postalCode,
            address: item.address,
            date: item.date,
            time: item.time,
            note: item.note,
            wasteItems: filterWasteItems,
            createdAt: item.createdAt,
          };
        }),
    );
    return res.status(200).json({
      message: 'List of order waste pickup',
      data: detailOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Display list decline for waste pickup
const getDeclineWastePickup = async (req, res) => {
  const {partnersId} = req.params;

  // Check condition
  const partner = await PartnerModel.findPartnerById(partnersId);

  if (!partner.length) {
    return res.status(404).json({
      message: 'Sorry, partner data not found',
    });
  }

  try {
    const orders = await PartnerModel.showDeclineWastePickup(partnersId);
    const detailOrders = await Promise.all(
        orders.map(async (item) => {
          // Display list name and quantity of waste items
          const wasteItems = await PartnerModel.showWasteItems(item.id);
          const filterWasteItems = await Promise.all(
              wasteItems.map(async (item) => {
                return {
                  name: item.name,
                  quantity: item.quantity,
                };
              }),
          );
          return {
            pickupId: item.id,
            status: item.status,
            name: item.name,
            phoneNumber: item.phoneNumber,
            province: item.province,
            subDistrict: item.subDistrict,
            village: item.village,
            postalCode: item.postalCode,
            address: item.address,
            date: item.date,
            time: item.time,
            note: item.note,
            wasteItems: filterWasteItems,
            createdAt: item.createdAt,
          };
        }),
    );
    return res.status(200).json({
      message: 'List of decline waste pickup',
      data: detailOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Accept user order for waste pickup
const setAcceptWastePickup = async (req, res) => {
  const {partnersId} = req.params;
  const {pickupId} = req.body;

  // Check condition
  const partner = await PartnerModel.findPartnerById(partnersId);

  if (!partner.length) {
    return res.status(404).json({
      message: 'Sorry, partner data not found',
    });
  }

  if (!pickupId) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  const wastePickup = await PartnerModel.showOrderWastePickup(partnersId);
  const checkWastePickup = wastePickup.find((item) => item.id === pickupId);

  if (!checkWastePickup) {
    return res.status(404).json({
      message: 'Sorry, waste pickup order data not found',
    });
  }

  try {
    const points = await setUserReceivedPoint(pickupId);
    await PartnerModel.acceptWastePickup(pickupId, points);
    return res.status(200).json({
      message: 'Waste pickup order is being processed by partner',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Decline user order for waste pickup
const setDeclineWastePickup = async (req, res) => {
  const {partnersId} = req.params;
  const {pickupId} = req.body;

  // Check condition
  const partner = await PartnerModel.findPartnerById(partnersId);

  if (!partner.length) {
    return res.status(404).json({
      message: 'Sorry, partner data not found',
    });
  }

  if (!pickupId) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  const wastePickups = await PartnerModel.showOrderWastePickup(partnersId);
  const checkWastePickup = wastePickups.find((item) => item.id === pickupId);

  if (!checkWastePickup) {
    return res.status(404).json({
      message: 'Sorry, waste pickup order data not found',
    });
  }

  try {
    await PartnerModel.declineWastePickup(pickupId);
    return res.status(200).json({
      message: 'Waste pickup order has been declined by partner',
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Calculate total points earned by user after order is accepted by partner
const setUserReceivedPoint = async (pickupId) => {
  const wasteItems = await PartnerModel.showWasteItems(pickupId);
  let totalPoints = 0;

  for (const item of wasteItems) {
    const {typeId, quantity} = item;
    const wasteType = await WastePickupModel.findWasteTypeById(typeId);

    if (wasteType) {
      const pointKg = wasteType.pointKg;
      const totalKg = Math.floor(quantity/wasteType.totalKg);

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

// Edit partner profile
const editProfile = async (req, res) => {
  const {partnersId} = req.params;
  const {body} = req;

  // Check condition
  const partner = await PartnerModel.findPartnerById(partnersId);

  if (!partner.length) {
    return res.status(404).json({
      message: 'Sorry, partner data not found',
    });
  };

  if (!body.name || !body.email || !body.phoneNumber) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  try {
    await PartnerModel.updatePartner(body, partnersId);
    return res.status(200).json({
      message: 'Your profile has been updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Reset partner password
const resetPassword = async (req, res) => {
  const {partnersId} = req.params;
  const {body} = req;

  // Check condition
  const partner = await PartnerModel.findPartnerById(partnersId);

  if (!partner.length) {
    return res.status(404).json({
      message: 'Sorry, partner data not found',
    });
  }

  if (!body.password || !body.confirmPassword) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  if (body.password !== body.confirmPassword) {
    return res.status(400).json({
      message: 'Password and confirmation password not match',
    });
  }

  try {
    await PartnerModel.updatePartner(body, partnersId);
    res.status(200).json({
      message: 'Your password has been changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Logout
const logout = async (req, res) => {
  const {authorization} = req.headers;

  // Check condition
  if (!authorization) {
    return res.status(401).json({
      message: `You don't have token`,
    });
  }

  try {
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET);

    // Add token to blacklisted tokens
    blacklistedTokens.push(token);

    res.status(200).json({
      message: 'You have successfully logged out',
    });
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid access token !!',
    });
  }
};

module.exports = {
  login,
  getOrderWastePickup,
  getDeclineWastePickup,
  setAcceptWastePickup,
  setDeclineWastePickup,
  editProfile,
  resetPassword,
  logout,
};
