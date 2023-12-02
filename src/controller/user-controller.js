const UsersModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {google} = require('googleapis');

// Register
const register = async (req, res) => {
  const {body} = req;
  const verifyEmail = await UsersModel.isUserRegistered(body);

  // Condition check
  if (
    !body.name || !body.email || !body.phoneNumber ||
    !body.password || !body.confirmPassword
  ) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  if (verifyEmail.length === 1) {
    return res.status(400).json({
      message: 'Sorry, email is already registered',
    });
  }

  if (body.password !== body.confirmPassword) {
    return res.status(400).json({
      message: 'Password and confirmation password not match',
    });
  }

  // Encrypt password
  const hashedPassword = await bcrypt.hash(body.password, 10);

  // Add new user account
  try {
    await UsersModel.createNewUser(body, hashedPassword);
    res.status(201).json({
      message: 'Congratulation, your account has been successfully created',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Login
const login = async (req, res) => {
  const {body} = req;

  // Condition check 1
  if (!body.email || !body.password) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
    });
  }

  // Find user
  try {
    const data = await UsersModel.authUser(body);
    // Condition check 2
    if (data === 'User data not found') {
      return res.status(404).json({
        message: 'Sorry, user data not found',
      });
    } else if (data === 'Incorrect password') {
      return res.status(401).json({
        message: 'The password you entered is incorrect. Please try again',
      });
    } else {
      const filterData = data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phoneNumber: item.phoneNumber,
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

// Display all users
const getUsers = async (req, res) => {
  try {
    const data = await UsersModel.showUsers();
    const filterData = data.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phoneNumber: item.phoneNumber,
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      message: 'List of all users',
      data: filterData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      errorMessage: error,
    });
  }
};

// Register with Google
const gClientId = process.env.GOOGLE_CLIENT_ID;
const gClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirUrl = `${process.env.SERVICE_LINK}/users/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(gClientId, gClientSecret, redirUrl);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true,
});

const authGoogle = (req, res) => {
  res.redirect(authorizationUrl);
};

const callbackGoogle = async (req, res) => {
  const {code} = req.query;
  const {tokens} = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });

  const {data} = await oauth2.userinfo.get();
  const verifyEmail = await UsersModel.isUserRegistered(data);

  // Check condition
  if (!data.name || !data.email) {
    return res.status(400).json({
      message: 'Failed to register with Google Account. Please enroll again',
    });
  }

  if (verifyEmail.length === 1) {
    return res.status(400).json({
      message: 'Sorry, email is registered',
    });
  }

  try {
    await UsersModel.createNewUser(data);
    const checkUser = await UsersModel.isUserRegistered(data);
    const userInfo = await checkUser.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phoneNumber: item.phoneNumber,
    }));

    return res.status(201).json({
      message: 'Congratulation, your account has been successfully created',
      data: userInfo,
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
  const {usersId} = req.params;
  const {body} = req;

  // Condition check
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

  // Encrypt password
  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    UsersModel.updateUser(body, usersId, hashedPassword);
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

module.exports = {
  register,
  authGoogle,
  callbackGoogle,
  login,
  getUsers,
  setPassword,
};
