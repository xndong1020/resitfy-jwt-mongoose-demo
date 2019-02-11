const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { emailValidator } = require('./validators')
const { userRole } = require('../enums')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'User email required'],
      minlength: 3,
      trim: true,
      index: { unique: true },
      validate: [
        {
          validator: emailValidator,
          message: props => `${props.value} is not a valid email address!`
        },
        {
          isAsync: true,
          validator: function(v, cb) {
            User.findOne({ email: v }, function(err, user) {
              cb(!user)
            })
          },
          message: props => `${props.value} has been used!`
        }
      ]
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

// The create() function fires save() hooks
// add pre-save hook to hash user password
// note: DO NOT USE arrow function here, as it wil change the context of 'this'
UserSchema.pre('save', async function(next) {
  const user = this
  console.log('isNew', user.isNew)
  console.log('isModified password', user.isModified('password'))
  if (!user.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)
    user.password = hash
    return next()
  } catch (e) {
    return next(e)
  }
})

UserSchema.post('findOneAndUpdate', async function(user, next) {
  // user is the query result of query. so it is not the user object in req, but the user in mongodb
  console.log('user', user)
})

UserSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password)
}

const User = mongoose.model('User', UserSchema)

module.exports = User
