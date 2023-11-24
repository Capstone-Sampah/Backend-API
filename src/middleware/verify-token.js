const jwt = require('jsonwebtoken');

const accessValidation = (req, res, next) => {
  const {authorization} = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message: 'Please enter valid access token. Access token needed',
    });
  }

  const token = authorization.split(' ')[1];
  const secret = process.env.JWT_SECRET;

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
};
