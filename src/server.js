// Import modules
const express = require('express');
const cors = require('cors');
const checkConnectionDB = require('./models/user-model');
const userRoutes = require('./routes/user-route');
const partnerRoutes = require('./routes/partner-route');
const wastePickupRoutes = require('./routes/waste-pickup-route');
const voucherRoutes = require('./routes/voucher-route');
const wasteRecycleRoutes = require('./routes/waste-recycle-route');

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
app.use('/users', userRoutes);
app.use('/partners', partnerRoutes);
app.use('/wastepickup', wastePickupRoutes);
app.use('/vouchers', voucherRoutes);
app.use('/recycle', wasteRecycleRoutes);

// Index route
app.get('/', (req, res) => {
  const message = `Hello and welcome to EcoBin API ♻️🗑️!`;
  console.log('Index route accessed');
  res.status(200).send(`<h2>${message}</h2>`);
});

// Middleware for handling route not found
app.use((req, res) => {
  const message = `The requested URL was not found on this server 😞!`;
  res.status(404).send(`<h2>${message}</h2>`);
});

// Connect to database
checkConnectionDB;

// Create web server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
