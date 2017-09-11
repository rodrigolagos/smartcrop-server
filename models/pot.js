'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PotSchema = Schema({
  humidity: Number,
  moisture: Number,
  roomTemperature: Number,
  temperature: Number,
  owner: {type: Schema.ObjectId, ref: 'User'},
  watchers: [{type: Schema.ObjectId, ref: 'User'}]
})

module.exports = mongoose.model('Pot', PotSchema)
