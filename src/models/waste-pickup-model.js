const db = require('../config/database');
const {getTimeAgoWastePickupCreated} = require('./time-formatting-model');

// Get partner data
const showOrganicPartner = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name, province, regency, district FROM partners 
                   WHERE categoryid=1`;
    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const showNonOrganicPartner = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id, name, province, regency, district FROM partners
                   WHERE categoryId=2;`;
    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Get waste type
const showOrganicWasteType = () => {
  return new Promise((resolve, reject) => {
    filterData = 'Organik';
    const query = `SELECT id, name, totalKg, pointKg FROM waste_type 
                   WHERE category='${filterData}'`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const showNonOrganicWasteType = () => {
  return new Promise((resolve, reject) => {
    filterData = 'Non Organik';
    const query = `SELECT id, name, totalKg, pointKg FROM waste_type
                   WHERE category='${filterData}'`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Insert waste pickup
const createWastePickup = (pickupData) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO waste_pickup SET ?', pickupData, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

// Insert waste items
const createWasteItems = (wasteItemsData) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO waste_items (pickupid, typeid, quantity) VALUES ?',
        [wasteItemsData], (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
  });
};

// Check partner in table available or not
const findPartnerById = (partnersId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM partners WHERE id = ?', partnersId,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result[0]);
          }
        });
  });
};

// Check waste type in table available or not
const findWasteTypeById = (typeId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM waste_type WHERE id = ?', typeId,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result[0]);
          }
        });
  });
};

// Get history waste pickup
const showPendingWastePickup = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_pickup.id, 
                    waste_pickup.phoneNumber,
                    waste_pickup.province,
                    waste_pickup.subDistrict,
                    waste_pickup.village,
                    waste_pickup.postalCode,
                    waste_pickup.address,
                    partners.name as partner,
                    partners_category.name as category, 
                    waste_pickup.status, 
                    waste_pickup.date, 
                    waste_pickup.time,
                    waste_pickup.createdAt FROM waste_pickup 
                    LEFT JOIN partners ON waste_pickup.partnersId = partners.id
                    LEFT JOIN partners_category ON 
                    partners.categoryId = partners_category.id WHERE 
                    waste_pickup.usersId=${usersId} && 
                    waste_pickup.status='Dalam Antrian'`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        const data = result.map((items) => {
          const timeAgo = getTimeAgoWastePickupCreated(items.created_at);
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

const showAcceptWastePickup = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT waste_pickup.id, 
                   waste_pickup.phoneNumber,
                   waste_pickup.province,
                   waste_pickup.subDistrict,
                   waste_pickup.village,
                   waste_pickup.postalCode,
                   waste_pickup.address,
                   partners.name as partner,
                   partners_category.name as category, 
                   waste_pickup.status, 
                   waste_pickup.date, 
                   waste_pickup.time,
                   waste_pickup.createdAt FROM waste_pickup 
                   LEFT JOIN partners ON waste_pickup.partnersId = partners.id
                   LEFT JOIN partners_category ON 
                   partners.categoryId = partners_category.id WHERE 
                   waste_pickup.usersId=${usersId} && 
                   waste_pickup.status='Sedang Diproses'`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        const data = result.map((items) => {
          const timeAgo = getTimeAgoWastePickupCreated(items.created_at);
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

const showDeclineWastePickup = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_pickup.id, 
                    waste_pickup.phoneNumber,
                    waste_pickup.province,
                    waste_pickup.subDistrict,
                    waste_pickup.village,
                    waste_pickup.postalCode,
                    waste_pickup.address,
                    partners.name as partner,
                    partners_category.name as category, 
                    waste_pickup.status, 
                    waste_pickup.date, 
                    waste_pickup.time,
                    waste_pickup.createdAt FROM waste_pickup 
                    LEFT JOIN partners ON waste_pickup.partnersId = partners.id
                    LEFT JOIN partners_category ON 
                    partners.categoryId = partners_category.id WHERE 
                    waste_pickup.usersId=${usersId} && 
                    waste_pickup.status='Permintaan Ditolak'`;

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        const data = result.map((items) => {
          const timeAgo = getTimeAgoWastePickupCreated(items.created_at);
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

const showOrderWasteItems = (pickupId) => {
  return new Promise((resolve, reject) => {
    const query = ` SELECT waste_type.name, waste_items.quantity 
                    FROM waste_items INNER JOIN waste_type 
                    ON waste_items.typeId = waste_type.id 
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

module.exports = {
  showOrganicPartner,
  showNonOrganicPartner,
  showOrganicWasteType,
  showNonOrganicWasteType,
  createWastePickup,
  createWasteItems,
  findPartnerById,
  findWasteTypeById,
  showPendingWastePickup,
  showAcceptWastePickup,
  showDeclineWastePickup,
  showOrderWasteItems,
};
