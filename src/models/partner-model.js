const db = require('../config/database');
const bcrypt = require('bcrypt');

// Partner login
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

// Get waste pickup
const showWastePickup = (partnersId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT waste_pickup.id,
                   users.name,
                   waste_pickup.phoneNumber,
                   waste_pickup.province,
                   waste_pickup.subDistrict,
                   waste_pickup.village,
                   waste_pickup.postalCode,
                   waste_pickup.address,
                   waste_pickup.date,
                   waste_pickup.time,
                   waste_pickup.note
                   FROM waste_pickup 
                   LEFT JOIN users ON users.id = waste_pickup.usersId 
                   WHERE waste_pickup.partnersId=${partnersId} && 
                   waste_pickup.status='Dalam Antrian';`;

    db.query(query, async (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Get waste items
const showWasteItems = (pickupId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT waste_items.typeId, waste_type.name, 
                   waste_items.quantity FROM waste_items INNER JOIN 
                   waste_type ON waste_items.typeId = waste_type.id 
                   WHERE waste_items.pickupId = ${pickupId};`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Update user 'waste_pickup' status
const declineWastePickup = (pickupId) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE waste_pickup SET status='Permintaan Ditolak' 
                   WHERE id = ${pickupId}`;
    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const acceptWastePickup = (pickupId, points) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE waste_pickup SET 
                   status = 'Sedang Diproses', totalPoints = ${points} 
                   WHERE id = ${pickupId}`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Get decline waste pickup
const showDeclineWastePickup = (partnersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_pickup.id,
                    users.name,
                    waste_pickup.phoneNumber,
                    waste_pickup.province,
                    waste_pickup.subDistrict,
                    waste_pickup.village,
                    waste_pickup.postalCode,
                    waste_pickup.address,
                    waste_pickup.date,
                    waste_pickup.time,
                    waste_pickup.note,
                    waste_pickup.status
                    FROM waste_pickup 
                    LEFT JOIN users ON users.id = waste_pickup.usersId 
                    WHERE waste_pickup.partnersId=${partnersId} && 
                    waste_pickup.status='Permintaan Ditolak';`;

    db.query(query, async (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Update partner data
const updatePartner = (body, partnersId, hashedPassword) => {
  return new Promise((resolve, reject) => {
    let query = `UPDATE partners SET `;

    if (body.name) {
      query += `name = '${body.name}', `;
    }

    if (body.email) {
      query += `email = '${body.email}', `;
    }

    if (body.phoneNumber) {
      query += `phoneNumber = '${phoneNumber}', `;
    }

    if (body.password) {
      query += `password = '${hashedPassword}', `;
    }

    query = query.slice(0, -2);
    query += ` WHERE id = ${partnersId}`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  authPartner,
  showWastePickup,
  showWasteItems,
  declineWastePickup,
  acceptWastePickup,
  showDeclineWastePickup,
  updatePartner,
};
