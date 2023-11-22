const express = require('express');
const dbPool = require('./config/database.js');
const app = express();

// Connect to database
dbPool.getConnection((error) => {
  if (error) {
    console.log('Connect to database failed...');
    console.log(error);
  } else {
    console.log('Connect to database success...');
  }
});

// Create web server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
