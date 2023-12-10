const db = require('../config/database');
const {getTimeAgoWastePickupCreated} = require('./time-formatting-model');

// Display list of organic partners
const showOrganicPartners = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name, province, subDistrict, village 
                   FROM partners WHERE categoryid=1`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display list of non-organic partners
const showNonOrganicPartners = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name, province, subDistrict, village 
                   FROM partners WHERE categoryId=2;`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display list of organic waste types
const showOrganicWasteTypes = () => {
  return new Promise((resolve, reject) => {
    const filterData = 'Organik';
    const query = `SELECT id, name, totalKg, pointKg FROM waste_type 
                   WHERE category = ?`;

    db.query(query, [filterData], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display list of non-organic waste types
const showNonOrganicWasteTypes = () => {
  return new Promise((resolve, reject) => {
    const filterData = 'Non Organik';
    const query = `SELECT id, name, totalKg, pointKg FROM waste_type
                   WHERE category = ?`;

    db.query(query, [filterData], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Ensure input user Id matches with user ID in the table
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

// Ensure input type ID matches with type ID in the table
const findWasteTypeById = (typeId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM waste_type WHERE id = ?';

    db.query(query, [typeId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0]);
      }
    });
  });
};

// Create waste pickup order
const createWastePickup = (pickupData) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO waste_pickup SET ?';

    db.query(query, [pickupData], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

// Enter selected waste type into waste pickup order
const createWasteItems = (wasteItemsData) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO waste_items (pickupid, typeid, quantity) 
                   VALUES ?`;

    db.query(query, [wasteItemsData], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display list of history waste pickup with status 'Dalam Antrian'
const showPendingWastePickup = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_pickup.id, 
                    waste_pickup.status, 
                    partners.name as partner,
                    partners_category.name as category, 
                    waste_pickup.phoneNumber,
                    waste_pickup.province,
                    waste_pickup.subDistrict,
                    waste_pickup.village,
                    waste_pickup.postalCode,
                    waste_pickup.address,
                    waste_pickup.date, 
                    waste_pickup.time,
                    waste_pickup.note,
                    waste_pickup.createdAt FROM waste_pickup 
                    LEFT JOIN partners ON 
                    waste_pickup.partnersId = partners.id
                    LEFT JOIN partners_category ON 
                    partners.categoryId = partners_category.id WHERE 
                    waste_pickup.usersId = ? && 
                    waste_pickup.status='Dalam Antrian'`;

    db.query(query, [usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        const data = result.map((items) => {
          const timeAgo = getTimeAgoWastePickupCreated(items.createdAt);
          return {
            ...items,
            timeAgo: timeAgo,
          };
        });
        resolve(data);
      }
    });
  });
};

// Display list of history waste pickup with status 'Sedang Diproses'
const showAcceptWastePickup = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_pickup.id, 
                    waste_pickup.status, 
                    partners.name as partner,
                    partners_category.name as category, 
                    waste_pickup.phoneNumber,
                    waste_pickup.province,
                    waste_pickup.subDistrict,
                    waste_pickup.village,
                    waste_pickup.postalCode,
                    waste_pickup.address,
                    waste_pickup.date, 
                    waste_pickup.time,
                    waste_pickup.note,
                    waste_pickup.createdAt FROM waste_pickup 
                    LEFT JOIN partners ON 
                    waste_pickup.partnersId = partners.id
                    LEFT JOIN partners_category ON 
                    partners.categoryId = partners_category.id WHERE 
                    waste_pickup.usersId = ? && 
                    waste_pickup.status='Sedang Diproses'`;

    db.query(query, [usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        const data = result.map((items) => {
          const timeAgo = getTimeAgoWastePickupCreated(items.createdAt);
          return {
            ...items,
            timeAgo: timeAgo,
          };
        });
        resolve(data);
      }
    });
  });
};

// Display list of history waste pickup with status 'Permintaan Ditolak'
const showDeclineWastePickup = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_pickup.id, 
                    waste_pickup.status, 
                    partners.name as partner,
                    partners_category.name as category, 
                    waste_pickup.phoneNumber,
                    waste_pickup.province,
                    waste_pickup.subDistrict,
                    waste_pickup.village,
                    waste_pickup.postalCode,
                    waste_pickup.address,
                    waste_pickup.date, 
                    waste_pickup.time,
                    waste_pickup.note,
                    waste_pickup.createdAt FROM waste_pickup 
                    LEFT JOIN partners ON 
                    waste_pickup.partnersId = partners.id
                    LEFT JOIN partners_category ON 
                    partners.categoryId = partners_category.id WHERE 
                    waste_pickup.usersId = ? && 
                    waste_pickup.status='Permintaan Ditolak'`;

    db.query(query, [usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        const data = result.map((items) => {
          const timeAgo = getTimeAgoWastePickupCreated(items.createdAt);
          return {
            ...items,
            timeAgo,
          };
        });
        resolve(data);
      }
    });
  });
};

// Display list of history waste items in waste pickup order
const showOrderWasteItems = (pickupId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_type.name, 
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

module.exports = {
  showOrganicPartners,
  showNonOrganicPartners,
  showOrganicWasteTypes,
  showNonOrganicWasteTypes,
  findUserById,
  findPartnerById,
  findWasteTypeById,
  createWastePickup,
  createWasteItems,
  showPendingWastePickup,
  showAcceptWastePickup,
  showDeclineWastePickup,
  showOrderWasteItems,
};
