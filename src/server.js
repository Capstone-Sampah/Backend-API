const express = require('express');
const checkConnectionDB = require('./models/user-model');
const usersRoutes = require('./routes/user-route');

const app = express();
require('dotenv').config();

// Static Middleware
app.use(express.json());

// Dynamically Middleware
app.use('/users', usersRoutes);

// Connect to database
checkConnectionDB;

// Create web server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
