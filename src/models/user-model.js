const db = require('../config/database');
const bcrypt = require('bcrypt');

// Check database connected or not
const checkConnectionDB = db.getConnection((error) => {
  if (error) {
    console.log('Connect to database failed....');
    console.log(error);
  } else {
    console.log('Connect to database success....');
  }
});

// Check user is registered or not
const isUserRegistered = (body) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE email = '${body.email}'`;
    db.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Registration new user
const createNewUser = (body, hashedPassword) => {
  const query = `INSERT INTO users (name, email, phoneNumber, password) VALUES 
                (
                  '${body.name}', '${body.email}', 
                  '${body.phoneNumber}', '${hashedPassword}'
                )`;

  return db.execute(query);
};

// User login
const authUser = (body) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT * FROM users WHERE email = '${body.email}'`;

    db.query(query, async (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.length === 0) {
          // Email not found
          resolve('User data not found');
        } else {
          const user = result[0];
          const password = user.password;

          // Decrypt password
          const isPasswordValid = await bcrypt.compare(body.password, password);

          if (isPasswordValid) {
            // User authentication success
            resolve(result);
          } else {
            // Incorrect password
            resolve('Incorrect password');
          }
        }
      }
    });
  });
};


module.exports = {
  checkConnectionDB,
  isUserRegistered,
  createNewUser,
  authUser,
};
