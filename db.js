const mongoose = require('mongoose')
const bluebird = require('bluebird')
require('dotenv').config() // to read value of process.env.MongoURI

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => console.log('Mongodb connected'))
  .catch(err => console.log(err))

// Get Mongoose to use the bluebird promise library
mongoose.Promise = bluebird

module.exports = mongoose
