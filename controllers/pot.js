'use strict'

const mongoose = require('mongoose')
const Pot = require('../models/pot')
const User = require('../models/user')
const FCM = require('fcm-push')

const serverKey = 'AAAAzN3W5Fg:APA91bH3AELfl3fd_HzADede2jhqMfVM4iGu9AakLuZOvWoQ2iQPTPrE30TwHw8Fgjj2mZ6bPPVfNQVPHyzurvUEWzGkGGCSn-wrqmOvzjPss3OPdSehCsd6MVnULVXCP1V4LnVdGD1Z'
const fcm = new FCM(serverKey)

function getPot (req, res) {
  let potId = req.params.potId

  if (!mongoose.Types.ObjectId.isValid(potId)) {
    return res.status(404).send({ message: 'El pot no existe', code: 404 })
  }

  Pot.findById(potId, '-__v', (err, pot) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!pot) return res.status(404).send({ message: 'El pot no existe', code: 404 })

    User.populate(pot, [{ path: 'watchers', select: '-__v -password' }, { path: 'owner', select: '-__v -password' }, { path: 'requests.user', select: '-__v -password' }], function (err, pot) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(pot)
    })
  })
}

function getPots (req, res) {
  let io = req.io
  Pot.find({}, '-__v', (err, pots) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    io.emit('welcome', 'pots')
    res.status(200).send(pots)
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
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    res.status(201).send(potStored)
  })
}

function updatePot (req, res) {
  let potId = req.params.potId
  let update = req.body

  if (!mongoose.Types.ObjectId.isValid(potId)) {
    return res.status(404).send({ message: 'El pot no existe', code: 404 })
  }

  if (update.owner !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(update.owner)) {
      return res.status(400).send({ message: 'El usuario no existe', code: 400 })
    }

    User.count({_id: update.owner}, function (err, count) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      if (count > 0) {
        Pot.findById(potId, (err, pot) => {
          if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
          if (!pot) return res.status(404).send({ message: 'El macetero no existe', code: 404 })

          if (pot.owner !== undefined && pot.owner !== null) {
            if (pot.owner.toString() === update.owner) {
              delete update['owner']
              return res.status(403).send({ message: 'Ya eres dueño de este macetero', code: 4031 })
            } else {
              let watchers = pot.watchers.toString()
              let usersInRequests = []

              for (var i = 0; i < (pot.requests).length; i++) {
                usersInRequests.push(pot.requests[i].user.toString())
              }
              if (watchers.indexOf(update.owner) === -1) {
                if (usersInRequests.indexOf(update.owner) === -1) {
                  update['$push'] = { requests: { user: update.owner } }
                  delete update['owner']
                } else {
                  return res.status(403).send({ message: 'Ya tienes una solicitud pendiente', code: 4033 })
                }
              } else {
                return res.status(403).send({ message: 'Ya eres observador de este macetero', code: 4032 })
              }
            }
          }

          Pot.findByIdAndUpdate(potId, update, { fields: '-__v', new: true }, (err, potUpdated) => {
            if (err) return res.status(500).send({ message: err.message, code: err.code })

            User.populate(potUpdated, [{ path: 'watchers', select: '-__v -password' }, { path: 'owner', select: '-__v -password' }, { path: 'requests.user', select: '-__v -password' }], function (err, pot) {
              if (err) return res.status(500).send({ message: err.message, code: err.code })
              res.status(200).send({ message: 'Macetero actualizado correctamente', pot: potUpdated })
            })
          })
        })
      } else {
        return res.status(400).send({ message: 'El usuario no existe', code: 400 })
      }
    })
  } else {
    Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      if (potUpdated.humidity > 60) {
        let message = {
          to: '/topics/demo',
          notification: {
            title: 'Humedad muy alta',
            body: 'La humedad en tu macetero es de ' + potUpdated.humidity + '%',
            sound: true
          }
        }
        fcm.send(message, function (err, response) {
          if (err) {
            console.log('Something has gone wrong!')
          } else {
            console.log('Successfully sent with response: ', response)
          }
        })
      }
      res.status(200).send(potUpdated)
    })
  }
}

function deletePot (req, res) {
  let potId = req.params.potId

  Pot.findById(potId, (err, pot) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    pot.remove(err => {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send({ message: 'El pot ha sido eliminado' })
    })
  })
}

function getPotsByOwner (req, res) {
  let userId = req.params.userId

  Pot.find({ 'owner': userId }, function (err, pots) {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    User.populate(pots, [{ path: 'watchers', select: '-__v -password' }, { path: 'owner', select: '-__v -password' }, { path: 'requests.user', select: '-__v -password' }], function (err, pots) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(pots)
    })
  })
}

function getPotsByWatcher (req, res) {
  let userId = req.params.userId

  Pot.find({ watchers: userId }, function (err, pots) {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    User.populate(pots, [{ path: 'watchers', select: '-__v -password' }, { path: 'owner', select: '-__v -password' }, { path: 'requests.user', select: '-__v -password' }], function (err, pots) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(pots)
    })
  })
}

function getRequests (req, res) {
  let potId = req.params.potId
  Pot.findById(potId, '-__v', (err, pot) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!pot) return res.status(404).send({ message: 'No existe el pot', code: 404 })

    User.populate(pot, [{ path: 'requests.user', select: '-__v -password' }], function (err, pots) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(pot.requests)
    })
  })
}

function updateRequestStatus (req, res) {
  let potId = req.params.potId
  let requestId = req.params.requestId
  let update = req.body

  Pot.findOneAndUpdate({_id: potId, 'requests._id': requestId}, {$set: {'requests.$.status': update.status}}, { new: true }, (err, potUpdated) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    if (update.status === 'accepted') {
      let request = potUpdated.requests.filter(function (obj) {
        return obj._id.toString() === requestId
      })
      let userId = request[0].user
      update['$addToSet'] = { watchers: userId }
      delete update['status']
      Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        res.status(200).send({ message: 'Estado de la solicitud actualizado' })
      })
    } else {
      res.status(200).send({ message: 'Estado de la solicitud actualizado' })
    }
  })
}

module.exports = {
  getPot,
  getPots,
  createPot,
  updatePot,
  deletePot,
  getPotsByOwner,
  getPotsByWatcher,
  getRequests,
  updateRequestStatus
}
