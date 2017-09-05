'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PotSchema = Schema({
  name: String,
  description: String
})

module.exports = mongoose.model('Pot', PotSchema)
