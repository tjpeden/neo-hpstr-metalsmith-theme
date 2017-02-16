const moment = require('moment');

module.exports = (date, format) => {
  return moment.utc(date).format(format);
};
