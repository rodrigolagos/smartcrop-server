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
    return res.status(404).send({ message: 'El pot no existe' })
  }

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

  if (!mongoose.Types.ObjectId.isValid(potId)) {
    return res.status(404).send({ status_code: 404, message: 'El pot no existe' })
  }

  if (update.owner !== undefined) {
    Pot.findById(potId, (err, pot) => {
      if (err) return res.status(500).send({ status_code: 500, message: `Error al realizar petición: ${err}` })
      if (!pot) return res.status(404).send({ status_code: 404, message: 'El macetero no existe' })

      if (pot.owner !== undefined) {
        if (pot.owner.toString() === update.owner) {
          delete update['owner']
          return res.status(202).send({ status_code: 202, message: 'Ya eres dueño u observador de este macetero' })
        } else {
          let watchers = pot.watchers.toString()
          if (watchers.indexOf(update.owner) === -1) {
            update['$addToSet'] = { watchers: update.owner }
            delete update['owner']
          } else {
            return res.status(202).send({ status_code: 202, message: 'Ya eres dueño u observador de este macetero' })
          }
        }
      }

      Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
        if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
        res.status(200).send({ status_code: 200, message: 'Macetero actualizado correctamente', pot: potUpdated })
      })
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
      res.status(200).send({ pot: potUpdated })
    })
  }

  // if (update.watchers !== undefined) {
  //   update['$addToSet'] = { watchers: update.watchers }
  //   delete update['watchers']
  // }

  // if (update.requests !== undefined) {
  //   Pot.findById(potId, (err, pot) => {
  //     if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
  //     if (!pot) return res.status(404).send({ message: 'El pot no existe' })
  //
  //     let watchers = pot.watchers.toString()
  //     let usersInRequests = []
  //
  //     for (var i = 0; i < (pot.requests).length; i++) {
  //       usersInRequests.push(pot.requests[i].userId.toString())
  //     }
  //
  //     if (pot.owner.toString() !== update.requests && watchers.indexOf(update.requests) === -1 && usersInRequests.indexOf(update.requests) === -1) {
  //       update['$push'] = { requests: { userId: update.requests } }
  //       delete update['requests']
  //     } else {
  //       delete update['requests']
  //     }
  //
  //     Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
  //       if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
  //       res.status(200).send({ pot: potUpdated })
  //     })
  //   })
  // } else {
  //   Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
  //     if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
  //     res.status(200).send({ pot: potUpdated })
  //   })
  // }
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
    if (pots.length === 0) return res.status(404).send({ message: 'No existen pots' })

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
    if (pots.length === 0) return res.status(404).send({ message: 'No existen pots' })

    User.populate(pots, [{ path: 'watchers' }, { path: 'owner' }], function (err, pots) {
      if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
      res.status(200).send({pots})
    })
  })
}

function updateRequestStatus (req, res) {
  let potId = req.params.potId
  let requestId = req.params.requestId
  let update = req.body

  Pot.findOneAndUpdate({_id: potId, 'requests._id': requestId}, {$set: {'requests.$.status': update.status}}, { new: true }, (err, potUpdated) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    console.log(potUpdated)
    res.status(200).send({ pot: potUpdated })
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
  updateRequestStatus
}
