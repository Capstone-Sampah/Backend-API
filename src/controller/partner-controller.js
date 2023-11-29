const PartnerModel = require('../models/partner-model');
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

module.exports = {
  login,
};
