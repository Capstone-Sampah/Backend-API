const express = require('express');
const checkConnectionDB = require('./models/user-model');
const app = express();

require('dotenv').config();

// Connect to database
checkConnectionDB;

// Create web server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
