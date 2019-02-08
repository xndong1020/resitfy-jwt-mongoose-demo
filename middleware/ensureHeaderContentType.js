const errors = require('restify-errors')

const ensureHeaderContentType = (req, res, next) => {
  if (req && !req.is('application/json')) {
    return next(new errors.InvalidContentError("Expect 'application/json'"))
  }
  return next()
}

module.exports = ensureHeaderContentType
