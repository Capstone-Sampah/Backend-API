// Import package
const moment = require('moment');

const getTimeAgoWastePickupCreated = (createdAt) => {
  // Get date 'created_at'
  const dateTime = moment(createdAt);
  // Get current time now
  const currentTime = moment();
  // Compare time between 'created_at' and 'now'
  const diffInDays = currentTime.diff(dateTime, 'days');

  let timeAgo = '';
  if (diffInDays <= 0) {
    // Time ago less than 24 hours
    const diffInHours = currentTime.diff(dateTime, 'hours');
    timeAgo = diffInHours < 1 ?
      'Kurang dari 1 jam yang lalu' :
      `${diffInHours} jam yang lalu`;
  } else {
    // Time ago more than 1 days
    timeAgo = `${diffInDays} yang lalu`;
  }

  return timeAgo;
};

module.exports = {
  getTimeAgoWastePickupCreated,
};
