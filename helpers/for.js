module.exports = (collection, options) => {
  const {offset = 0, limit} = options.hash;

  return collection
  .slice(offset, limit && offset + limit)
  .map(item => options.fn(item))
  .join('\n');
}
