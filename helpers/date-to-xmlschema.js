const moment = require('moment');

module.exports = (date) => {
  return moment(date).format();
}
