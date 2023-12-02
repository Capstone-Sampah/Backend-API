const db = require('../config/database');

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

module.exports = {
  showOrganicPartner,
  showNonOrganicPartner,
  showOrganicWasteType,
  showNonOrganicWasteType,
  createWastePickup,
  createWasteItems,
  findPartnerById,
  findWasteTypeById,
};
