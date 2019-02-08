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
