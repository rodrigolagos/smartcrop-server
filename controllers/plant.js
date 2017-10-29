'use strict'

const mongoose = require('mongoose')
const Plant = require('../models/plant')

function getPlant (req, res) {
  let plantId = req.params.plantId

  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    return res.status(404).send({ message: 'La planta no existe', code: 404 })
  }

  Plant.findById(plantId, '-__v', (err, plant) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!plant) return res.status(404).send({ message: 'La planta no existe', code: 404 })

    res.status(200).send(plant)
  })
}

function getPlants (req, res) {
  Plant.find({}, '-__v', (err, plants) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    res.status(200).send(plants)
  })
}

function createPlant (req, res) {
  let plant = Plant()
  plant.name = req.body.name
  plant.maxTemp = req.body.maxTemp
  plant.minTemp = req.body.minTemp
  plant.maxRoomTemp = req.body.maxRoomTemp
  plant.minRoomTemp = req.body.minRoomTemp
  plant.maxHum = req.body.maxHum
  plant.minHum = req.body.minHum
  plant.maxMoist = req.body.maxMoist
  plant.minMoist = req.body.minMoist
  plant.description = req.body.description

  plant.save((err, plantStored) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    res.status(201).send(plantStored)
  })
}

function updatePlant (req, res) {
  let plantId = req.params.plantId
  let update = req.body

  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    return res.status(404).send({ message: 'La planta no existe', code: 404 })
  }

  Plant.findByIdAndUpdate(plantId, update, { fields: '-__v', new: true }, (err, plantUpdated) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    res.status(200).send(plantUpdated)
  })
}

function deletePlant (req, res) {
  let plantId = req.params.plantId

  Plant.findById(plantId, (err, plant) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    plant.remove(err => {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send({ message: 'La planta ha sido eliminado' })
    })
  })
}

module.exports = {
  getPlant,
  getPlants,
  createPlant,
  updatePlant,
  deletePlant
}
