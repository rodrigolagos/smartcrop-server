'use strict'

const mongoose = require('mongoose')
const Pot = require('../models/pot')
const User = require('../models/user')
const Plant = require('../models/plant')
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

    if (pot.owner !== undefined) {
      User.populate(pot, [{ path: 'watchers', select: '-__v -password' }, { path: 'owner', select: '-__v -password' }, { path: 'requests.user', select: '-__v -password' }], function (err, pot) {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        Plant.populate(pot, { path: 'plant', select: '-__v' }, function (err, pots) {
          if (err) return res.status(500).send({ message: err.message, code: err.code })
          res.status(200).send(pots)
        })
      })
    } else {
      User.populate(pot, [{ path: 'watchers', select: '-__v -password' }, { path: 'requests.user', select: '-__v -password' }], function (err, pot) {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        Plant.populate(pot, { path: 'plant', select: '-__v' }, function (err, pots) {
          if (err) return res.status(500).send({ message: err.message, code: err.code })
          res.status(200).send(pots)
        })
      })
    }
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

              console.log(update['$push'].requests)
              let request = potUpdated.requests.filter(function (obj) {
                return obj.user._id.toString() === update['$push'].requests.user
              })
              let requestId = request[0]._id
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  potId: potId,
                  requestId: requestId,
                  typeData: 2,
                  notificationUrl: '',
                  notificationTitle: 'Nueva solicitud',
                  notificationContent: 'Han solicitado ver tu macetero',
                  notificationOpenOnClick: 'NOTIFICATION'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Solicitud de observar pot: Successfully sent with response: ', response)
                }
              })

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
      if (!potUpdated) return res.status(404).send({ message: 'El pot no existe', code: 404 })

      Plant.populate(potUpdated, { path: 'plant', select: '-__v' }, function (err, pot) {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        User.populate(potUpdated, [{ path: 'owner', select: '-__v -password' }, { path: 'watchers', select: '-__v -password' }], function (err, pot) {
          if (err) return res.status(500).send({ message: err.message, code: err.code })

          let io = req.io
          let clients = []
          if (potUpdated.owner !== undefined) {
            clients.push(potUpdated.owner.socketId)
          }
          potUpdated.watchers.forEach(function (el) {
            clients.push(el.socketId)
          })

          if (update['humidity'] !== undefined) {
            clients.forEach(function (el) {
              io.to(el).emit('humidity', {message: potUpdated.humidity})
            })
            if (potUpdated.humidity > potUpdated.plant.maxHum) {
              console.log(potUpdated.owner.deviceToken)
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Humedad muy alta',
                  notificationContent: 'La humedad en tu macetero es de ' + potUpdated.humidity + '%',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Humedad muy alta: Successfully sent with response: ', response)
                }
              })
            } else if (potUpdated.humidity < potUpdated.plant.minHum) {
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Humedad muy baja',
                  notificationContent: 'La humedad en tu macetero es de ' + potUpdated.humidity + '%',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Humedad muy baja: Successfully sent with response: ', response)
                }
              })
            }
          }
          if (update['moisture'] !== undefined) {
            clients.forEach(function (el) {
              io.to(el).emit('moisture', {message: potUpdated.moisture})
            })
            if (potUpdated.moisture > potUpdated.plant.maxMoist) {
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Humedad terrestre muy alta',
                  notificationContent: 'La humedad terrestre n tu macetero es de ' + potUpdated.moisture + '%',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Humedad de tierra muy alta: Successfully sent with response: ', response)
                }
              })
            } else if (potUpdated.moisture < potUpdated.plant.minMoist) {
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Humedad terrestre muy baja',
                  notificationContent: 'La humedad terrestre en tu macetero es de ' + potUpdated.moisture + '%',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Humedad de tierra muy baja: Successfully sent with response: ', response)
                }
              })
            }
          }
          if (update['roomTemperature'] !== undefined) {
            clients.forEach(function (el) {
              io.to(el).emit('room temperature', {message: potUpdated.roomTemperature})
            })
            if (potUpdated.roomTemperature > potUpdated.plant.maxRoomTemp) {
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Temperatura ambiental muy alta',
                  notificationContent: 'La temperatura ambiental en tu macetero es de ' + potUpdated.roomTemperature + 'ºC',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Temperatura ambiental muy alta: Successfully sent with response: ', response)
                }
              })
            } else if (potUpdated.roomTemperature < potUpdated.plant.minRoomTemp) {
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Temperatura ambiental muy baja',
                  notificationContent: 'La temperatura ambiental en tu macetero es de ' + potUpdated.roomTemperature + 'ºC',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Temperatura ambiental muy baja: Successfully sent with response: ', response)
                }
              })
            }
          }
          if (update['temperature'] !== undefined) {
            clients.forEach(function (el) {
              io.to(el).emit('temperature', {message: potUpdated.temperature})
            })
            if (potUpdated.temperature > potUpdated.plant.maxTemp) {
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Temperatura de la tierra muy alta',
                  notificationContent: 'La temperatura de la tierra en tu macetero es de ' + potUpdated.temperature + 'ºC',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Temperatura de la tierra muy alta: Successfully sent with response: ', response)
                }
              })
            } else if (potUpdated.temperature < potUpdated.plant.minTemp) {
              let message = {
                to: potUpdated.owner.deviceToken,
                data: {
                  typeData: 1,
                  notificationUrl: '',
                  notificationTitle: 'Temperatura de la tierra muy baja',
                  notificationContent: 'La temperatura de la tierra en tu macetero es de ' + potUpdated.temperature + 'ºC',
                  notificationOpenOnClick: 'POTS'
                }
              }
              fcm.send(message, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!')
                } else {
                  console.log('Temperatura de la tierra muy baja: Successfully sent with response: ', response)
                }
              })
            }
          }
          res.status(200).send({ message: 'Macetero actualizado correctamente', pot: potUpdated })
        })
      })
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
      Plant.populate(pots, { path: 'plant', select: '-__v' }, function (err, pots) {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        res.status(200).send(pots)
      })
    })
  })
}

function getPotsByWatcher (req, res) {
  let userId = req.params.userId

  Pot.find({ watchers: userId }, function (err, pots) {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    User.populate(pots, [{ path: 'watchers', select: '-__v -password' }, { path: 'owner', select: '-__v -password' }, { path: 'requests.user', select: '-__v -password' }], function (err, pots) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      Plant.populate(pots, { path: 'plant', select: '-__v' }, function (err, pots) {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        res.status(200).send(pots)
      })
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
      console.log(request)
      let userId = request[0].user
      update['$addToSet'] = { watchers: userId }
      delete update['status']
      Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        User.populate(potUpdated, [{ path: 'requests.user', select: '-__v -password' }], function (err, pots) {
          if (err) return res.status(500).send({ message: err.message, code: err.code })

          let request = potUpdated.requests.filter(function (obj) {
            return obj._id.toString() === requestId
          })
          let message = {
            to: request[0].user.deviceToken,
            data: {
              typeData: 1,
              notificationUrl: '',
              notificationTitle: 'Han aceptado tu solicitud',
              notificationContent: 'Tu solicitud para observar un macetero ha sido aceptada',
              notificationOpenOnClick: 'POTS'
            }
          }
          fcm.send(message, function (err, response) {
            if (err) {
              console.log('Something has gone wrong!')
            } else {
              console.log('Solicitud para ver macetero aceptada: Successfully sent with response: ', response)
            }
          })
          res.status(200).send({ message: 'Estado de la solicitud actualizado' })
        })
      })
    } else {
      User.populate(potUpdated, [{ path: 'requests.user', select: '-__v -password' }], function (err, pots) {
        if (err) return res.status(500).send({ message: err.message, code: err.code })

        let request = potUpdated.requests.filter(function (obj) {
          return obj._id.toString() === requestId
        })
        let message = {
          to: request[0].user.deviceToken,
          data: {
            typeData: 1,
            notificationUrl: '',
            notificationTitle: 'Han rechazado tu solicitud',
            notificationContent: 'Tu solicitud para observar un macetero ha sido rechazada',
            notificationOpenOnClick: 'POTS'
          }
        }
        fcm.send(message, function (err, response) {
          if (err) {
            console.log('Something has gone wrong!')
          } else {
            console.log('Solicitud para ver macetero rechazada: Successfully sent with response: ', response)
          }
        })
        res.status(200).send({ message: 'Estado de la solicitud actualizado' })
      })
    }
  })
}

function deleteWatcher (req, res) {
  let potId = req.params.potId
  let userId = req.params.userId

  Pot.findById(potId, (err, pot) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!pot) return res.status(404).send({message: 'No existe el pot', code: 404})

    let watchers = pot.watchers.toString()
    if (watchers.indexOf(userId) === -1) {
      return res.status(403).send({ message: 'Aun no eres observador de este pot', code: 403 })
    } else {
      Pot.findOneAndUpdate({_id: potId}, {$pull: { 'watchers': userId }}, { new: true, safe: true, multi: true }, (err, potUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })

        res.status(200).send({ message: 'Observador eliminado', post: potUpdated })
      })
    }
  })
}

function deleteOwner (req, res) {
  let potId = req.params.potId
  let userId = req.params.userId

  Pot.findById(potId, (err, pot) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!pot) return res.status(404).send({message: 'No existe el pot', code: 404})

    if (pot.owner.toString() === userId) {
      Pot.findByIdAndUpdate(potId, {$unset: { owner: 1, plant: 1, requests: 1, watchers: 1, humidity: 1, moisture: 1, roomTemperature: 1, temperature: 1 }}, (err, potUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        if (!potUpdated) return res.status(404).send({message: 'No existe el pot', code: 404})

        res.status(200).send({ message: 'Dueño eliminado', pot: potUpdated })
      })
    } else {
      return res.status(403).send({message: 'No eres dueño de este macetero', code: 403})
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
  updateRequestStatus,
  deleteWatcher,
  deleteOwner
}
