const moment = require('moment');

module.exports = function(date, next, options) {
  if(!moment(date).isSame(next, 'year')) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};
