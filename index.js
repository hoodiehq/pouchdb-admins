module.exports = {
  admins: require('./lib/api')
}

/* istanbul ignore next */
if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(module.exports)
}
