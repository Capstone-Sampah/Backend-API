const UsersModel = require('../models/user-model');

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

  // Add new user account
  try {
    await UsersModel.createNewUser(body);
    res.status(201).json({
      message: 'Congratulation, your account has been successfuly created',
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
    // Condition check 1
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

      res.status(200).json({
        message: 'You have successfully login in your account',
        data: filterData,
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
  register,
  login,
};
