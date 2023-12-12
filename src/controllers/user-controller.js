const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsersModel = require('../models/user-model');
const {blacklistedTokens} = require('../middleware/verify-token');

// User registration
const register = async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
  } = req.body;

  let {
    latitude,
    longitude,
    password,
  } = req.body;

  // Check condition 1
  if (!name || !email || !phoneNumber || !password) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  const verifyEmail = await UsersModel.isUserRegistered(email);

  if (verifyEmail.length === 1) {
    return res.status(400).json({
      message: 'Sorry, email is already registered',
    });
  }

  if (latitude && typeof latitude !== 'number') {
    return res.status(400).json({
      message: 'Sorry, data type entered for latitude should be a number',
    });
  }

  if (longitude && typeof longitude !== 'number') {
    return res.status(400).json({
      message: 'Sorry, data type entered for longitude should be a number',
    });
  }

  // Convert data type from 'number' to 'float'
  if (latitude && longitude) {
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
  }

  // Encrypt password
  password = await bcrypt.hash(password, 10);

  // Wrap user data into an object
  const userData = {
    name,
    email,
    phoneNumber,
    password,
    latitude: latitude || null,
    longitude: longitude || null,
  };

  try {
    await UsersModel.createNewUser(userData);
    return res.status(201).json({
      message: 'Congratulation, your account has been successfully created',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// User login
const login = async (req, res) => {
  const {body} = req;

  // Check condition 1
  if (!body.email || !body.password) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  try {
    // Find user
    const data = await UsersModel.authUser(body);
    // Check condition 2
    if (data === 'User data not found') {
      return res.status(404).json({
        message: 'Sorry, user data not found',
      });
    } else if (data === 'Incorrect password') {
      return res.status(401).json({
        message: 'The password you entered is incorrect. Please try again !!',
      });
    } else {
      const filterData = data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phoneNumber: item.phoneNumber,
        latitude: item.latitude,
        longitude: item.longitude,
        createdAt: item.createdAt,
      }));

      // JSON Web Token (JWT)
      const payload = {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
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

// Display user activity
const getUserActivity = async (req, res) => {
  const {usersId} = req.params;

  // Check condition
  const user = await UsersModel.findUserById(usersId);
  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  try {
    const data = await UsersModel.showUserActivity(usersId);
    return res.status(200).json({
      message: 'List of user activity',
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Edit user profile
const editProfile = async (req, res) => {
  const {usersId} = req.params;
  const {body} = req;

  // Check condition
  const user = await UsersModel.findUserById(usersId);
  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
    });
  }

  if (!body.name || !body.email || !body.phoneNumber) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  try {
    await UsersModel.updateUser(body, usersId);
    return res.status(200).json({
      message: 'Your profile has been updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

// Reset user password
const resetPassword = async (req, res) => {
  const {usersId} = req.params;
  const {body} = req;

  // Check condition
  const user = await UsersModel.findUserById(usersId);

  if (!user.length) {
    return res.status(404).json({
      message: 'Sorry, user data not found',
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
    UsersModel.updateUser(body, usersId);
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
  register,
  login,
  getUserActivity,
  editProfile,
  resetPassword,
  logout,
};
