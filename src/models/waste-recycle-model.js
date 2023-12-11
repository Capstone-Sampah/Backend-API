const db = require('../config/database');

// Display list of video links for waste management
const showRecycleLinks = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM recycle_links;';

    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display recommendation video links for waste management based on type
const showRecycleLinksByType = (wasteType) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM recycle_links WHERE type = ?';

    db.query(query, [wasteType], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  showRecycleLinks,
  showRecycleLinksByType,
};
