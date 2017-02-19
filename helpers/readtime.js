const Handlebars = require('handlebars');

module.exports = (words_per_minute, content) => {
  let words = content
  .toString()
  .replace(/<(?:.|\n)*?>/gm, '')
  .split(/\s+/)
  .length;
  let time = Math.ceil(words / words_per_minute);

  return `${time} ${time === 1 ? 'minute' : 'minutes'}`;
};
