const passport = require('passport')

const passportJWT = require('passport-jwt')

const ExtractJWT = passportJWT.ExtractJwt

const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User')
const JWTStrategy = passportJWT.Strategy
require('dotenv').config()

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, cb) {
      return User.findOne({ email, password })
        .then(user => {
          if (!user) {
            return cb(null, false, { message: 'Incorrect email or password.' })
          }

          return cb(null, user, {
            message: 'Logged In Successfully'
          })
        })
        .catch(err => {
          return cb(err)
        })
    }
  )
)

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    function(jwtPayload, cb) {
      //find the user in db if needed
      return User.findOneById(jwtPayload.sub)
        .then(user => {
          return cb(null, user)
        })
        .catch(err => {
          return cb(err)
        })
    }
  )
)
