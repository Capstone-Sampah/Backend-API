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
                   partners.subDistrict, 
                   partners.village, 
                   partners.postalCode, 
                   partners.address, 
                   partners.createdAt 
                   FROM partners 
                   INNER JOIN partners_category ON 
                   partners.categoryId=partners_category.id 
                   WHERE partners.email = ?;`;

    db.query(query, [body.email], async (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.length === 0) {
          // Email not found
          resolve('Partner data not found');
        } else {
          const partner = result[0];
          const password = partner.password;

          // Decyrpt password
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

// Ensure input partner ID matches with partner ID in the table
const findPartnerById = (partnersId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM partners WHERE id = ?';

    db.query(query, [partnersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display list order for waste pickup
const showOrderWastePickup = (partnersId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT waste_pickup.id,
                   waste_pickup.status,
                   users.name,
                   waste_pickup.phoneNumber,
                   waste_pickup.province,
                   waste_pickup.subDistrict,
                   waste_pickup.village,
                   waste_pickup.postalCode,
                   waste_pickup.latitude,
                   waste_pickup.longitude,
                   waste_pickup.address,
                   waste_pickup.date,
                   waste_pickup.time,
                   waste_pickup.note,
                   waste_pickup.createdAt
                   FROM waste_pickup 
                   LEFT JOIN users ON users.id = waste_pickup.usersId 
                   WHERE waste_pickup.partnersId = ? && 
                   waste_pickup.status='Dalam Antrian';`;

    db.query(query, [partnersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display list decline for waste pickup
const showDeclineWastePickup = (partnersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_pickup.id,
                    waste_pickup.status,
                    users.name,
                    waste_pickup.phoneNumber,
                    waste_pickup.province,
                    waste_pickup.subDistrict,
                    waste_pickup.village,
                    waste_pickup.postalCode,
                    waste_pickup.latitude,
                    waste_pickup.longitude,
                    waste_pickup.address,
                    waste_pickup.date,
                    waste_pickup.time,
                    waste_pickup.note,
                    waste_pickup.createdAt
                    FROM waste_pickup 
                    LEFT JOIN users ON users.id = waste_pickup.usersId 
                    WHERE waste_pickup.partnersId = ? && 
                    waste_pickup.status='Permintaan Ditolak';`;

    db.query(query, [partnersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display list waste items in order of waste pickup
const showWasteItems = (pickupId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT waste_items.typeId, 
                   waste_type.name, 
                   waste_items.quantity 
                   FROM waste_items 
                   INNER JOIN waste_type ON waste_items.typeId = waste_type.id 
                   WHERE waste_items.pickupId = ?;`;

    db.query(query, [pickupId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Accept user order for waste pickup
const acceptWastePickup = (pickupId, points) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE waste_pickup SET 
                   status = 'Sedang Diproses', totalPoints = ? 
                   WHERE id = ?`;

    db.query(query, [points, pickupId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Decline user order for waste pickup
const declineWastePickup = (pickupId) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE waste_pickup SET status='Permintaan Ditolak' 
                   WHERE id = ?`;

    db.query(query, [pickupId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Update partner data
const updatePartner = (body, partnersId) => {
  return new Promise(async (resolve, reject) => {
    let query = `UPDATE partners SET `;

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

    db.query(query, [partnersId], (error, result) => {
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
  findPartnerById,
  showOrderWastePickup,
  showDeclineWastePickup,
  showWasteItems,
  acceptWastePickup,
  declineWastePickup,
  updatePartner,
};
