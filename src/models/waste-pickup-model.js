const db = require('../config/database');

// Get Partner Data
const showOrganicPartner = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT partners.id as PartnerID, 
      partners.name as PartnerName,
      partners_category.id as CategoryId,
      partners_category.name as CategoryName,
      partners.regency as Regency
      FROM waste_pickup 
      RIGHT JOIN partners ON waste_pickup.partnersId=partners.id
      RIGHT JOIN partners_category ON partners.categoryId=partners_category.id
      WHERE CategoryId=1 
      ORDER BY PartnerID ASC;`;
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
    const query = `SELECT partners.id as PartnerID, 
      partners.name as PartnerName,
      partners_category.id as CategoryId,
      partners_category.name as CategoryName,
      partners.regency as Regency
      FROM waste_pickup 
      RIGHT JOIN partners ON waste_pickup.partnersId=partners.id
      RIGHT JOIN partners_category ON partners.categoryId=partners_category.id
      WHERE CategoryId=2
      ORDER BY PartnerID ASC;`;
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
};
