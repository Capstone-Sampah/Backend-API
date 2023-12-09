const PartnerModel = require('../models/partner-model');
const WastePickupModel = require('../models/waste-pickup-model');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

// Login
const login = async (req, res) => {
  const {body} = req;

  // Condition Check 1
  if (!body.email || !body.password) {
    return res.status(400).json({
      message: 'You entered data does not match what instructed in form',
    });
  }

  // Find partner
  try {
    const data = await PartnerModel.authPartner(body);
    // Condition check 1
    if (data === 'Partner data not found') {
      return res.status(400).json({
        message: 'Sorry, partner data not found',
      });
    } else if ( data === 'Incorrect password') {
      return res.status(401).json({
        message: 'The password you entered is incorrect. Please try again',
      });
    } else {
      const filterData = data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        email: item.email,
        phoneNumber: item.phoneNumber,
        province: item.province,
        regency: item.regency,
        district: item.district,
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

// Display waste pickup request
const getOrderWastePickup = async (req, res) => {
  const {partnersId} = req.params;
  try {
    const orders = await PartnerModel.showWastePickup(partnersId);
    const detailOrders = await Promise.all(
        orders.map(async (item) => {
          const wasteItems = await PartnerModel.showWasteItems(item.id);
          // Only display name and quantity of waste items
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
          };
        }),
    );
    return res.status(200).json({
      message: 'List waste pickup request',
      data: detailOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Decline waste pickup request
const setDeclineWastePickup = async (req, res) => {
  const {partnersId} = req.params;
  const {pickupId} = req.body;

  const wastePickups = await PartnerModel.showWastePickup(partnersId);
  const checkWastePickup = wastePickups.find((item) => item.id === pickupId);

  // Check condition
  if (!pickupId) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  if (!checkWastePickup) {
    return res.status(400).json({
      message: 'Sorry, data for user waste pickup request not found',
    });
  }

  try {
    await PartnerModel.declineWastePickup(pickupId);
    return res.status(200).json({
      message: 'Waste pickup request rejected by partner',
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Accept waste pickup request
const setAcceptWastePickup = async (req, res) => {
  const {partnersId} = req.params;
  const {pickupId} = req.body;

  const wastePickup = await PartnerModel.showWastePickup(partnersId);
  const checkWastePickup = wastePickup.find((item) => item.id === pickupId);

  // Check condition
  if (!pickupId) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  if (!checkWastePickup) {
    return res.status(400).json({
      message: 'Sorry, data for user waste pickup request not found',
    });
  }

  try {
    const points = await setUserReceivedPoint(pickupId);
    await PartnerModel.acceptWastePickup(pickupId, points);
    return res.status(200).json({
      message: 'Waste pickup request is being processed by partner',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Send received point to user
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

// Display decline waste pickup request
const getDeclineWastePickup = async (req, res) => {
  const {partnersId} = req.params;
  try {
    const orders = await PartnerModel.showDeclineWastePickup(partnersId);
    const detailOrders = await Promise.all(
        orders.map(async (item) => {
          const wasteItems = await PartnerModel.showWasteItems(item.id);
          // Only display name and quantity of waste items
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
            status: item.status,
            wasteItems: filterWasteItems,
          };
        }),
    );
    return res.status(200).json({
      message: 'List decline waste pickup request',
      data: detailOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Forgot password
const setPassword = async (req, res) => {
  const {partnersId} = req.params;
  const {body} = req;

  // Chek condition
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
    const hashedPassword = await bcrypt.hash(body.password, 10);
    await PartnerModel.updatePartner(body, partnersId, hashedPassword);
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
  delete req.headers['Authorization'];
  return res.status(200).json({
    message: 'You have successfully logged out',
  });
};

module.exports = {
  login,
  getOrderWastePickup,
  setDeclineWastePickup,
  setAcceptWastePickup,
  getDeclineWastePickup,
  setPassword,
  logout,
};
