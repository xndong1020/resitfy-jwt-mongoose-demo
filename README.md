# Introduction
JSON Web Tokens is an authentication standard that works by assigning and passing around an encrypted token in requests that helps to identify the logged in user, instead of storing the user in a session on the server and creating a cookie. 

Passport is a Node.js middleware that offers a variety of different request authentication strategies that are easy to implement. By default, it stores the user object in session.

However, Passport allows an option to store the user object in request instead of the session, In this project, we use Passport and JSON Web Tokens to authenticate user.

Here is how everything is going to work:
-When the user logs in, the backend creates a signed token and returns it in response
-The client saves the token locally (typically in localStorage) and sends it back in every subsequent request that needs authentication
-All requests needing authentication pass through a middleware that checks the provided token and allows the request only if the token is verified

## Step 01:
```
npm install --save passport passport-local passport-jwt jsonwebtoken bcryptjs mongoose restify restify-errors bluebird dotenv
```

## Step 02:
Create a server.js file
```
const restify = require('restify')
require('dotenv').config()
require('./db')
const server = restify.createServer()

// middleware
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.listen(process.env.PORT, () => {
  console.log(`server listening at ${process.env.PORT}`)
})

```
And db.js for database
```
const mongoose = require('mongoose')
const bluebird = require('bluebird')
require('dotenv').config() // to read value of process.env.MongoURI

mongoose.set('userFindAndModify', false)
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => console.log('Mongodb connected'))
  .catch(err => console.log(err))

// Get Mongoose to use the bluebird promise library
mongoose.Promise = bluebird

module.exports = mongoose

```

## Step 03: Now add a route
```
...
require('./routes/users')(server)
...
```

This will cause a server error, you need to create a users.js file under /routes/ like so:

```
const errors = require('restify-errors')
const User = require('../models/User')

module.exports = server => {
  server.get('/users', async (req, res, next) => {
    try {
      const users = await User.find({}, { __v: 0 })
      res.send(users)
      next() //for Restify, whenever you are done, you need to call next()
    } catch (err) {
      return next(new errors.InvalidContentError(err))
    }
  })

  server.get('/user/:id', async (req, res, next) => {
    try {
      const userId = req.params.id
      await User.findOne({ _id: userId }, { __v: 0 })
      res.send(201)
      next() //for Restify, whenever you are done, you need to call next()
    } catch (err) {
      return next(new errors.InvalidContentError(err))
    }
  })

  server.post('/users', async (req, res, next) => {
    try {
      const user = await User.create(req.body)
      res.send(user)
      next() //for Restify, whenever you are done, you need to call next()
    } catch (err) {
      return next(new errors.InvalidContentError(err))
    }
  })

  server.put('/user/:id', async (req, res, next) => {
    try {
      const userId = req.params.id
      await User.findOneAndUpdate({ _id: userId }, req.body)
      res.send(204)
      next() //for Restify, whenever you are done, you need to call next()
    } catch (err) {
      return next(new errors.InvalidContentError(err))
    }
  })

  server.del('/user/:id', async (req, res, next) => {
    try {
      const userId = req.params.id
      await User.findOneAndRemove({ _id: userId })
      res.send(204)
      next() //for Restify, whenever you are done, you need to call next()
    } catch (err) {
      return next(new errors.InvalidContentError(err))
    }
  })
}

```

## Step 04: As we are using Mongoose, we need to have our User model class ready:
```
const mongoose = require('mongoose')
const { emailValidator } = require('./validators')
const { userRole } = require('../enums')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: [true, 'User email required'],
      validate: {
        validator: emailValidator,
        message: props => `${props.value} is not a valid email address!`
      }
    },
    role: {
      type: String,
      required: true,
      enum: Object.keys(userRole).map(key => userRole[key])
    },
    password: {
      type: String,
      min: [6, 'Password should be at lease 6 digits long'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.model('User', UserSchema)

module.exports = User

```

Please note for 'email' we are using a custom validation, and for 'role' we will check if the value is in 'userRole' enum values
As we are using Mongoose validation, we don't need to use other server validation rules in the routes.

## Step 05: We added 2 custom middleware to demo how to do request validation, as well as error handling in Express/Restify
```
const errors = require('restify-errors')

const ensureHeaderContentType = (req, res, next) => {
  if (req && !req.is('application/json')) {
    return next(new errors.InvalidContentError("Expect 'application/json'"))
  }
  return next()
}

module.exports = ensureHeaderContentType

const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

module.exports = logErrors
```
And use them globally
```
// in server.js

...
// middleware
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())
// custom middleware to ensure the request ContentType is application/json
server.use(ensureHeaderContentType)
// check error message in console
server.use(logErrors)
...
```

## Step 06. There is a couple of ways to auth user with jwt token.
### Solution A: Use Passport Local strategy
```
// passport.js, which defines who to authenticate an user

const passport = require('passport')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const LocalStrategy = require('passport-local').Strategy

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    // done is a method called internally by the strategy implementation.
    async (email, password, done) => {
      // The returned user object is pre-formatted and will be storing in JWT
      try {
        const user = await User.findOne({ email })
        if (!user)
          return done(null, false, { message: 'Incorrect email or password.' })

        // check is user password is match
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
          return done(null, false, { message: 'Incorrect password!' })

        //When success is called, it can attach the user to the request or do other things
        return done(null, user, { message: 'Logged In Successfully' })
      } catch (err) {
        err => done(err)
      }
    }
  )
)

```

And create a login route
```
const jwt = require('jsonwebtoken')
// not the passport.js we wrote, but the lib itself
const passport = require('passport')
require('dotenv').config()

module.exports = server => {
  server.post('/auth/login', async (req, res, next) => {
    // using passport local to login user
    // err, user, info are read from 'done' callback method, which is internally used by Passport strategy
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return res.send(err)
      if (!err && !user) return res.send(info)
      req.login(user, { session: false }, err => {
        if (err) {
          res.send(err)
        }
        // generate a signed son web token with the contents of user object and return it in the response
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
          expiresIn: 604800 // 1 week
        })
        // get issue at and expire date
        const { iat, exp } = jwt.decode(token)
        // the sub claim must be unique.
        return res.send({ iat, exp, sub: user._id, name: user.name, token })
      })
    })(req, res)
    next()
  })
}

```

and protect all routes except '/auth/login'
```
const restify = require('restify')
const { ensureHeaderContentType, logErrors } = require('./middleware')
const rjwt = require('restify-jwt-community')
require('dotenv').config()
require('./passport')
require('./db')
const server = restify.createServer()

require('./routes/users')(server)
require('./routes/auth')(server)

// middleware
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())
server.use(
  rjwt({ secret: process.env.JWT_SECRET }).unless({ path: ['/auth/login'] })
)
// custom middleware to ensure the request ContentType is application/json
server.use(ensureHeaderContentType)
// check error message in console
server.use(logErrors)

server.listen(process.env.PORT, () => {
  console.log(`server listening at ${process.env.PORT}`)
})

```


### Solution B: Write your own auth logic(much simpler)
```
// /services/authService.js
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const authenticate = async ({ email, password }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email })
      if (!user) reject(new Error('Email was not registered'))
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) resolve(user)
      else reject(new Error('Invalid credentials.'))
    } catch (err) {
      return reject(err)
    }
  })
}

module.exports = {
  authenticate
}

```

Then use it in your auth route
```
const jwt = require('jsonwebtoken')
const errors = require('restify-errors')
require('dotenv').config()
const auth = require('../services/authService')

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
``` 



