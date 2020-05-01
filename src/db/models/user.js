const mongoose = require('mongoose')
const crypto = require('crypto')
const { isEmail, isAlphanumeric } = require('validator')
const Schema = mongoose.Schema

/**
 * User Schema
 */

const UserSchema = new Schema({
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String, 
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  hashed_password: {
    type: String,
    default: ''
  },
  salt: {
    type: String,
    default: ''
  }
})

/**
 * Validations
 */

UserSchema.path('name').validate((name) => name.length, 'Name cannot be blank')

UserSchema.path('email').validate((email) => email.length, 'Email cannot be blank')

UserSchema.path('email').validate(isEmail, 'Invalid email')

UserSchema.path('email').validate((email) => {
  return new Promise(resolve => {
    const User = mongoose.model('User')
    if (this.isNew || this.isModified('email')) {
      User.find({ email }).exec((err, users) => resolve(!err && !users.length))
    } else resolve(true)
  })
}, 'Email `{VALUE}` already exists')

UserSchema.path('username').validate((username) => username.length, 'Username cannot be blank')

UserSchema.path('email').validate(isAlphanumeric, 'Invalid username')

UserSchema.path('hashed_password').validate(
  (hashed_password) => hashed_password.length && this._password.length, 'Password cannot be blank'
)

/**
 * Virtuals
 */

UserSchema.virtual('password')
  .set((password) => {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(() => this._password)

/**
 * Pre-save hook
 */

UserSchema.pre('save', () => {
  if (this.isNew && !this.password && this.password.length) {
    throw new Error('Invalid password')
  }
})

/**
 * Methods
 */

UserSchema.methods = {
  /**
   * Authenticate - check passwords
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt() {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword(password) {
    if (!password) return ''
    try {
      return crypto
        .createHmac('sha256', this.salt)
        .update(password)
        .digest('hex')
    } catch (err) {
      return ''
    }
  }
}