const db = require('../config/database');

// Display all voucher
const showVoucher = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM voucher';
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
  showVoucher,
};
