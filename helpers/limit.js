module.exports = (collection, limit, start) => {
  return collection.slice( start, limit + 1 );
}
