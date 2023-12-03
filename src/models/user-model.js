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
  const phoneNumber = typeof body.phoneNumber === 'undefined' ?
                      'NULL' : body.phoneNumber;

  const query = `INSERT INTO users (name, email, phoneNumber, password) VALUES 
                (
                  '${body.name}', '${body.email}', 
                  '${phoneNumber}', '${hashedPassword}'
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

// Display all users
const showUsers = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users';
    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Update user data
const updateUser = (body, usersId, hashedPassword) => {
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
    query += `password = '${hashedPassword}', `;
  }

  query = query.slice(0, -2);
  query += ` WHERE id = ${usersId}`;

  return db.execute(query);
};

module.exports = {
  checkConnectionDB,
  isUserRegistered,
  createNewUser,
  authUser,
  showUsers,
  updateUser,
};
