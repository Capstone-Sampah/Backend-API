const db = require('../config/database');
const bcrypt = require('bcrypt');

// Partner Login
const authPartner = (body) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT partners.id, 
                          partners.name, 
                          partners_category.name AS category, 
                          partners.email, 
                          partners.password,
                          partners.phoneNumber, 
                          partners.province, 
                          partners.regency, 
                          partners.district, 
                          partners.postalCode, 
                          partners.address, 
                          partners.createdAt 
                          FROM partners 
                          INNER JOIN partners_category ON 
                          partners.categoryId=partners_category.id 
                          WHERE partners.email = '${body.email}';`;

    db.query(query, async (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.length === 0) {
          // Email not found
          resolve('Partner data not found');
        } else {
          const partner = result[0];
          const password = partner.password;

          // Decyrpt Password
          const isPasswordValid = await bcrypt.compare(body.password, password);

          if (isPasswordValid) {
            // Partner authentication success
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
  authPartner,
};
