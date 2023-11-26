// Import modules
const express = require('express');
const cors = require('cors');
const checkConnectionDB = require('./models/user-model');
const usersRoutes = require('./routes/user-route');

const app = express();
require('dotenv').config();

// Static Middleware
app.use(express.json());

// Allowing access to all domain
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Dynamically Middleware
app.use('/users', usersRoutes);

// Connect to database
checkConnectionDB;

// Create web server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
