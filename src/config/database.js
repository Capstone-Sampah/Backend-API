const mysql = require('mysql2');

const dbPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecobin_app',
});

module.exports = dbPool;
