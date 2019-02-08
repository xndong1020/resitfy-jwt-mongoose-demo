const passport = require('passport')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const LocalStrategy = require('passport-local').Strategy

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    // done is a method called internally by the strategy implementation.
    (email, password, done) => {
      // The returned user object is pre-formatted and will be storing in JWT
      return User.findOne({ email })
        .then(user => {
          if (!user)  
            return done(null, false, { message: 'Incorrect email or password.' })
        
          // check is user password is match
          const isMatch = await bcrypt.compare(password, user.password)
          if (!isMatch) 
            return done(null, false, { message: 'Incorrect password!' })
          
          //When success is called, it can attach the user to the request or do other things
          return done(null, user, { message: 'Logged In Successfully' }) 
        })
        .catch(err => cb(err))
    }
  )
)
