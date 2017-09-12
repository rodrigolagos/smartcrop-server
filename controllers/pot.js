'use strict'

const Pot = require('../models/pot')
const User = require('../models/user')

function getPot (req, res) {
  let potId = req.params.potId

  Pot.findById(potId, (err, pot) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!pot) return res.status(404).send({ message: 'El pot no existe' })

    User.populate(pot, [{ path: 'watchers' }, { path: 'owner' }], function (err, pot) {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      res.status(200).send({pot})
    })
  })
}

function getPots (req, res) {
  Pot.find({}, (err, pots) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!pots) return res.status(404).send({ message: 'No existen pots' })

    User.populate(pots, [{ path: 'watchers' }, { path: 'owner' }], function (err, pots) {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      res.status(200).send({pots})
    })
  })
}

function createPot (req, res) {
  console.log('POST /api/pots')
  console.log(req.body)

  let pot = Pot()
  pot.humidity = req.body.humidity
  pot.moisture = req.body.moisture
  pot.roomTemperature = req.body.roomTemperature
  pot.temperature = req.body.temperature

  pot.save((err, potStored) => {
    if (err) return res.status(500).send({ message: `Error al guardar pot: ${err}` })
    res.status(200).send({ pot: potStored })
  })
}

function updatePot (req, res) {
  let potId = req.params.potId
  let update = req.body

  if (update.watchers !== undefined) {
    update['$addToSet'] = { watchers: update.watchers }
    delete update['watchers']
  }

  if (update.requests !== undefined) {
    Pot.findById(potId, (err, pot) => {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      if (!pot) return res.status(404).send({ message: 'El pot no existe' })

      let watchers = pot.watchers.toString()
      let usersInRequests = []

      for (var i = 0; i < (pot.requests).length; i++) {
        usersInRequests.push(pot.requests[i].userId.toString())
      }

      if (pot.owner.toString() !== update.requests && watchers.indexOf(update.requests) === -1 && usersInRequests.indexOf(update.requests) === -1) {
        update['$push'] = { requests: { userId: update.requests } }
        delete update['requests']
      } else {
        delete update['requests']
      }

      Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
        if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
        res.status(200).send({ pot: potUpdated })
      })
    })
  } else {
    Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      res.status(200).send({ pot: potUpdated })
    })
  }
}

function deletePot (req, res) {
  let potId = req.params.potId

  Pot.findById(potId, (err, pot) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    pot.remove(err => {
      if (err) return res.status(500).send({ message: `Error al borrar pot: ${err}` })
      res.status(200).send({ message: 'El pot ha sido eliminado' })
    })
  })
}

function getPotsByOwner (req, res) {
  let userId = req.params.userId

  Pot.find({ 'owner': userId }, function (err, pots) {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!pots) return res.status(404).send({ message: 'No existen pots' })

    User.populate(pots, [{ path: 'watchers' }, { path: 'owner' }], function (err, pots) {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      res.status(200).send({pots})
    })
  })
}

function getPotsByWatcher (req, res) {
  let userId = req.params.userId

  Pot.find({ watchers: userId }, function (err, pots) {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!pots) return res.status(404).send({ message: 'No existen pots' })

    User.populate(pots, [{ path: 'watchers' }, { path: 'owner' }], function (err, pots) {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      res.status(200).send({pots})
    })
  })
}

module.exports = {
  getPot,
  getPots,
  createPot,
  updatePot,
  deletePot,
  getPotsByOwner,
  getPotsByWatcher
}
