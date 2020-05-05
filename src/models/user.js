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
    trim: true,
    required: true
  },
  lastname: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String, 
    trim: true,
    lowercase: true,
    required: true,
    validate: [isEmail, 'Invalid username']
  },
  username: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    minlength: 5,
    validate: [isAlphanumeric, 'Invalid username']
  },
  hashed_password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
})

/**
 * Complex validations
 */

UserSchema.path('hashed_password').validate(
  function(hashed_password){
    return hashed_password.length, 'Password cannot be blank'
  } 
)

/**
 * Virtuals
 */

UserSchema.virtual('password')
  .set(function(password) {
    this.salt = this.makeSalt()
    this._password = password
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() {
    return this._password 
  })

/**
 * Pre-save hook
 */

UserSchema.pre('save', function() {
  if (this.isNew && !this.password && this.password.length) {
    throw new Error('Invalid password')
  }
})

/**
 * Methods
 */

UserSchema.methods = {
  /**
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * @return {String}
   * @api public
   */

  makeSalt() {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  },

  /**
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

module.exports = mongoose.model('User', UserSchema)