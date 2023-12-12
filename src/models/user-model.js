const db = require('../config/database');
const bcrypt = require('bcrypt');

// Check database connected or not
const checkConnectionDB = db.getConnection((error) => {
  if (error) {
    console.log('Connect to database failed...');
    console.log(error);
  } else {
    console.log('Connect to database success...');
  }
});

// Check user is registered or not
const isUserRegistered = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// User registration
const createNewUser = (userData) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users SET ?`;

    db.query(query, [userData], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Authentication user to connect to application
const authUser = (body) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [body.email], async (err, result) => {
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
            // Success authentication
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

// Ensure input user ID matches with user ID in the table
const findUserById = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE id = ?';

    db.query(query, [usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display user activity
const showUserActivity = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT point, sendWaste, managedWaste 
                    FROM users WHERE id= ?`;

    db.query(query, [usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Update user data
const updateUser = (body, usersId) => {
  return new Promise(async (resolve, reject) => {
    let query = `UPDATE users SET `;

    if (body.name) {
      query += `name = '${body.name}', `;
    }
    if (body.email) {
      query += `email = '${body.email}', `;
    }
    if (body.phoneNumber) {
      query += `phoneNumber = '${body.phoneNumber}', `;
    }
    if (body.password) {
      // Encrypt password
      const hashedPassword = await bcrypt.hash(body.password, 10);
      query += `password = '${hashedPassword}', `;
    }

    query = query.slice(0, -2);
    query += ` WHERE id = ?`;

    db.query(query, [usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  checkConnectionDB,
  isUserRegistered,
  createNewUser,
  authUser,
  findUserById,
  showUserActivity,
  updateUser,
};
