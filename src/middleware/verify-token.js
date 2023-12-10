const jwt = require('jsonwebtoken');

// Array for save blacklist tokens
const blacklistedTokens = [];

// Compare header token with JWT_SECRET (env) for validation
const accessValidation = (req, res, next) => {
  const {authorization} = req.headers;

  // Check condition
  if (!authorization) {
    return res.status(401).json({
      message: 'Please enter valid access token. Access token needed !!',
    });
  }

  const token = authorization.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  // Check token is listed in blaclist tokens or not
  if (blacklistedTokens.includes(token)) {
    return res.status(401).json({
      message: 'This token has been invalidated. Please log in again !!',
    });
  }

  try {
    const jwtDecode = jwt.verify(token, secret);
    req.userData = jwtDecode;
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid access token',
    });
  }

  next();
};

module.exports = {
  accessValidation,
  blacklistedTokens,
};
