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
