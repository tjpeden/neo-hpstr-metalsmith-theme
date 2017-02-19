const moment = require('moment');

module.exports = function(date, next) {
  return !moment(date).isSame(next, 'year');
};
