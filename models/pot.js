'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PotSchema = Schema({
  name: {type: String, default: 'Maceta'},
  humidity: {type: Number, default: 0},
  moisture: {type: Number, default: 0},
  roomTemperature: {type: Number, default: 0},
  temperature: {type: Number, default: 0},
  owner: {type: Schema.ObjectId, ref: 'User'},
  watchers: [{type: Schema.ObjectId, ref: 'User'}],
  requests: [{
    user: { type: Schema.ObjectId, ref: 'User' },
    status: { type: String, enum: ['on hold', 'accepted', 'rejected'], default: 'on hold' }
  }]
})

module.exports = mongoose.model('Pot', PotSchema)
