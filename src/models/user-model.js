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

// Registration new user
const createNewUser = (body) => {
  const query = `INSERT INTO users (name, email, phone_number, password) VALUES 
                (
                  '${body.name}', '${body.email}', 
                  '${body.phoneNumber}', '${body.password}'
                )`;

  return db.execute(query);
};

module.exports = {
  checkConnectionDB,
  createNewUser,
};
