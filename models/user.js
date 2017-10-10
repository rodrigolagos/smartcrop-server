'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  nickname: { type: String, unique: true, required: true },
  avatar: { type: String, default: 'default.jpg' },
  invitations: [{
    pot: { type: Schema.ObjectId, ref: 'Pot' },
    status: { type: String, enum: ['on hold', 'accepted', 'rejected'], default: 'on hold' }
  }]
})

UserSchema.pre('save', function (next) {
  let user = this
  if (!user.isModified('password')) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err)

      user.password = hash
      next()
    })
  })
})

module.exports = mongoose.model('User', UserSchema)
