const db = require('../config/database');

// Check database connected or not
const checkConnectionDB = db.getConnection((error) => {
  if (error) {
    console.log('Connect to database failed....');
    console.log(error);
  } else {
    console.log('Connect to database success....');
  }
});

module.exports = {
  checkConnectionDB,
};
