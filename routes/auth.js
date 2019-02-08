const jwt = require('jsonwebtoken')
const errors = require('restify-errors')
// not the passport.js we wrote, but the lib itself
const passport = require('passport')
require('dotenv').config()
const auth = require('../services/authService')

// module.exports = server => {
//   server.post('/auth/login', async (req, res, next) => {
//     // using passport local to login user
//     // err, user, info are read from 'done' callback method, which is internally used by Passport strategy
//     passport.authenticate('local', { session: false }, (err, user, info) => {
//       if (err) return res.send(err)
//       if (!err && !user) return res.send(info)
//       req.login(user, { session: false }, err => {
//         if (err) {
//           res.send(err)
//         }
//         // generate a signed son web token with the contents of user object and return it in the response
//         const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
//           expiresIn: 604800 // 1 week
//         })
//         // get issue at and expire date
//         const { iat, exp } = jwt.decode(token)
//         // the sub claim must be unique.
//         return res.send({ iat, exp, sub: user._id, name: user.name, token })
//       })
//     })(req, res)
//     next()
//   })
// }

module.exports = server => {
  server.post('/auth/login', async (req, res, next) => {
    try {
      const user = await auth.authenticate(req.body)
      const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
        expiresIn: '15m'
      })
      // get issue at and expire date
      const { iat, exp } = jwt.decode(token)
      // the sub claim must be unique.
      res.send({ iat, exp, sub: user._id, name: user.name, token })
      next()
    } catch (err) {
      return next(new errors.UnauthorizedError(err))
    }
  })
}
