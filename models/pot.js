'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PotSchema = Schema({
  humidity: {type: Number, default: 0},
  moisture: {type: Number, default: 0},
  roomTemperature: {type: Number, default: 0},
  temperature: {type: Number, default: 0},
  owner: {type: Schema.ObjectId, ref: 'User'},
  watchers: [{type: Schema.ObjectId, ref: 'User'}]
})

module.exports = mongoose.model('Pot', PotSchema)
