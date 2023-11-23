const UsersModel = require('../models/user-model');

// Register
const register = async (req, res) => {
  const {body} = req;

  // Condition check
  if (
    !body.name || !body.email || !body.phoneNumber ||
    !body.password || !body.confirmPassword
  ) {
    return res.status(400).json({
      message: 'You entered data does not match what was instructed in form',
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


module.exports = {
  register,
};
