'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PlantSchema = Schema({
  name: String,
  maxTemp: {type: Number, default: 0},
  minTemp: {type: Number, default: 0},
  maxRoomTemp: {type: Number, default: 0},
  minRoomTemp: {type: Number, default: 0},
  maxHum: {type: Number, default: 0},
  minHum: {type: Number, default: 0},
  maxMoist: {type: Number, default: 0},
  minMoist: {type: Number, default: 0},
  description: String,
  tips: [{
    type: String,
    description: String
  }]
})

module.exports = mongoose.model('Plant', PlantSchema)
