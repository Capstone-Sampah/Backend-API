const db = require('../config/database');

// Display all voucher
const showVoucher = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM vouchers';
    db.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Look for vouchers that user hopes exist or not
const findVoucherById = (vouchersId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM vouchers WHERE id = ?';
    db.query(query, [vouchersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Ensure that input user ID matches with user ID in the table
const findUserById = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users where id = ?';
    db.query(query, [usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Reduce user point after redeeming voucher
const setUserPoint = (usersId, userPoint, voucherPoint) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE users SET point = ? WHERE id = ?';
    db.query(query, [userPoint - voucherPoint, usersId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Reduce total vouchers after user redeems that voucher
const setVoucherTotal = (vouchersId, newVoucherTotal, newVoucherStatus) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE vouchers SET total = ?, status = ? WHERE id = ?';
    db.query(query, [
      newVoucherTotal,
      newVoucherStatus,
      vouchersId,
    ], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Create voucher receipt after user redeem voucher successfully
const createVoucherReceipt = (usersId, vouchersId, voucherToken) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO vouchers_receipt 
                  (vouchersId, usersId, exchangeToken) 
                  VALUES (?, ?, ?)`;
    db.query(query, [vouchersId, usersId, voucherToken], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

// Display voucher receipt after user redeems voucher successfully
const showNewVoucherReceipt = (receiptId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT vouchers_receipt.id,
                          users.name as user,
                          vouchers.name as voucher,
                          users.point as currentPoint,
                          vouchers_receipt.exchangeToken,
                          vouchers_receipt.createdAt
                  FROM vouchers_receipt 
                  INNER JOIN users ON 
                  vouchers_receipt.usersId = users.id
                  INNER JOIN vouchers ON 
                  vouchers_receipt.vouchersId = vouchers.id
                  WHERE vouchers_receipt.id = ?;`;

    db.query(query, [receiptId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Display receipt vouchers owned by user
const showVoucherReceipt = (usersId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT vouchers_receipt.id,
                          users.name as name,
                          vouchers.name as voucher,
                          vouchers_receipt.exchangeToken,
                          vouchers_receipt.createdAt
                   FROM vouchers_receipt 
                   LEFT JOIN users ON 
                   vouchers_receipt.usersId = users.id
                   LEFT JOIN vouchers ON 
                   vouchers_receipt.vouchersId = vouchers.id
                   WHERE vouchers_receipt.id = ?;`;

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
  showVoucher,
  findVoucherById,
  findUserById,
  setUserPoint,
  setVoucherTotal,
  createVoucherReceipt,
  showNewVoucherReceipt,
  showVoucherReceipt,
};
