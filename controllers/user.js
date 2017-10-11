'use strict'

const User = require('../models/user')
const Pot = require('../models/pot')
const tokenService = require('../services/token')
const bcrypt = require('bcrypt-nodejs')
const nodemailer = require('nodemailer')
const FCM = require('fcm-push')

const serverKey = 'AAAAzN3W5Fg:APA91bH3AELfl3fd_HzADede2jhqMfVM4iGu9AakLuZOvWoQ2iQPTPrE30TwHw8Fgjj2mZ6bPPVfNQVPHyzurvUEWzGkGGCSn-wrqmOvzjPss3OPdSehCsd6MVnULVXCP1V4LnVdGD1Z'
const fcm = new FCM(serverKey)

function getUser (req, res) {
  let userId = req.params.userId

  User.findById(userId, '-__v -password', (err, user) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!user) return res.status(404).send({ message: 'El usuario no existe', code: 404 })

    res.status(200).send(user)
  })
}

function getUserByEmailOrNickname (req, res) {
  let userEmailOrNickname = req.params.userEmailOrNickname

  let query = {$or: [{email: {$regex: userEmailOrNickname, $options: 'i'}}, {nickname: {$regex: userEmailOrNickname, $options: 'i'}}]}

  User.find(query, '-__v -password', (err, users) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!users) return res.status(404).send({ message: 'El usuario no existe', code: 404 })

    res.status(200).send(users)
  })
}

function getUsers (req, res) {
  User.find({}, '-__v -password', (err, users) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    res.status(200).send(users)
  })
}

function signUp (req, res) {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    nickname: req.body.nickname
  })

  if (req.file !== undefined) {
    user.avatar = req.file.filename
  }

  user.save((err) => {
    if (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: err.message, code: 400 })
      }
      if (err.code === 11000) {
        // email or nickname could violate the unique index. we need to find out which field it was.
        var field = err.message.split('index: ')[1]
        field = field.split(' dup key')[0]
        field = field.substring(0, field.lastIndexOf('_'))
        if (field === 'email') {
          return res.status(409).send({ message: field + ' already exists.', code: 4091 })
        } else {
          return res.status(409).send({ message: field + ' already exists.', code: 4092 })
        }
      }
      return res.status(500).send({ message: err.code })
    }
    return res.status(201).send({ message: 'Usuario creado correctamente' })
  })
}

function signIn (req, res) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!user) return res.status(404).send({message: 'No existe el usuario', code: 404})

    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) return res.status(500).send({message: err.message})
      if (!result) return res.status(401).send({message: 'Usuario o contraseña incorrectos', code: 401})

      req.user = user
      res.status(200).send({
        message: 'Logueado correctamente',
        token: tokenService.createToken(user)
      })
    })
  })
}

function updateUser (req, res) {
  let userId = req.params.userId
  let update = req.body

  if (req.file !== undefined) {
    update.avatar = req.file.filename
  }

  if (update.newPassword !== undefined) {
    if (update.password === undefined) {
      return res.status(400).send({ message: 'Para cambiar contraseña debe ingresar contraseña actual', code: 4001 })
    }
    User.findOne({ _id: userId }, (err, user) => {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      if (!user) return res.status(404).send({message: 'No existe el usuario', code: 404})

      bcrypt.compare(update.password, user.password, (err, result) => {
        if (err) return res.status(500).send({message: err.message})
        if (!result) return res.status(401).send({message: 'Contraseña actual incorrecta', code: 401})

        bcrypt.genSalt(10, (err, salt) => {
          if (err) return res.status(500).send({message: err.message})

          bcrypt.hash(update.newPassword, salt, null, (err, hash) => {
            if (err) return res.status(500).send({message: err.message})

            update.password = hash
            delete update['newPassword']

            User.findByIdAndUpdate(userId, update, { fields: '-__v -password', new: true }, (err, userUpdated) => {
              if (err) {
                if (err.name === 'ValidationError') {
                  return res.status(400).send({ message: err.message, code: 400 })
                }
                if (err.code === 11000) {
                  // email or nickname could violate the unique index. we need to find out which field it was.
                  var field = err.message.split('index: ')[1]
                  field = field.split(' dup key')[0]
                  field = field.substring(0, field.lastIndexOf('_'))
                  if (field === 'email') {
                    return res.status(409).send({ message: field + ' already exists.', code: 4091 })
                  } else {
                    return res.status(409).send({ message: field + ' already exists.', code: 4092 })
                  }
                }
                return res.status(500).send({ message: err.code })
              }

              res.status(200).send({ message: 'Usuario actualizado correctamente', user: userUpdated })
            })
          })
        })
      })
    })
  } else {
    if (update.password !== undefined) {
      delete update['password']
    }
    User.findByIdAndUpdate(userId, update, { fields: '-__v -password', new: true }, (err, userUpdated) => {
      if (err) {
        if (err.name === 'ValidationError') {
          return res.status(400).send({ message: err.message, code: 400 })
        }
        if (err.code === 11000) {
          // email or nickname could violate the unique index. we need to find out which field it was.
          var field = err.message.split('index: ')[1]
          field = field.split(' dup key')[0]
          field = field.substring(0, field.lastIndexOf('_'))
          if (field === 'email') {
            return res.status(409).send({ message: field + ' already exists.', code: 4091 })
          } else {
            return res.status(409).send({ message: field + ' already exists.', code: 4092 })
          }
        }
        return res.status(500).send({ message: err.code })
      }

      res.status(200).send({ message: 'Usuario actualizado correctamente', user: userUpdated })
    })
  }
}

function deleteUser (req, res) {
  let userId = req.params.userId

  User.findById(userId, (err, pot) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    pot.remove(err => {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send({ message: 'El usuario ha sido eliminado' })
    })
  })
}

function getMyProfile (req, res) {
  // Delete this verification and use auth middleware
  if (!req.headers.authorization) {
    return res.status(403).send({message: 'Sin autorización'})
  }

  const token = req.headers.authorization.split(' ')[1]

  tokenService.decodeToken(token)
    .then(response => {
      let userId = response

      User.findById(userId, '-__v -password', (err, user) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        if (!user) return res.status(404).send({message: 'No existe el usuario', code: 404})

        res.status(200).send(user)
      })
    })
    .catch(response => {
      res.status(response.status).send({message: response.message})
    })
}

function createInvitation (req, res) {
  let userId = req.params.userId
  let potId = req.body.potId
  let update = {}

  User.findById(userId, '-__v -password', (err, user) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!user) return res.status(404).send({ message: 'No existe el usuario', code: 404 })

    let potsInInvitations = []

    for (var i = 0; i < (user.invitations).length; i++) {
      potsInInvitations.push(user.invitations[i].pot.toString())
    }

    if (potsInInvitations.indexOf(potId) === -1) {
      update['$push'] = { invitations: { pot: potId } }
      User.findByIdAndUpdate(userId, update, { fields: '-__v -password', new: true }, (err, userUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })

        Pot.populate(userUpdated, [{ path: 'invitations.pot', select: '-__v' }], function (err, user) {
          if (err) return res.status(500).send({ message: err.message, code: err.code })

          let message = {
            to: userUpdated.deviceToken,
            notification: {
              title: 'Nueva invitación',
              body: 'Te han invitado a observar un macetero',
              sound: true
            }
          }
          fcm.send(message, function (err, response) {
            if (err) {
              console.log('Something has gone wrong while sending new invitation!')
            } else {
              console.log('Invitation successfully sent with response: ', response)
            }
          })

          res.status(200).send({ message: 'Usuario actualizado correctamente', user: userUpdated })
        })
      })
    } else {
      return res.status(403).send({ message: 'Ya has invitado a este usuario', code: 4034 })
    }
  })
}

function getInvitations (req, res) {
  let userId = req.params.userId
  User.findById(userId, '-__v -password', (err, user) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!user) return res.status(404).send({ message: 'No existe el usuario', code: 404 })

    res.status(200).send(user.invitations)
  })
}

function updateInvitationStatus (req, res) {
  let userId = req.params.userId
  let invitationId = req.params.invitationId
  let update = req.body

  User.findOneAndUpdate({_id: userId, 'invitations._id': invitationId}, {$set: {'invitations.$.status': update.status}}, { new: true }, (err, userUpdated) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    if (update.status === 'accepted') {
      let invitation = userUpdated.invitations.filter(function (obj) {
        return obj._id.toString() === invitationId
      })
      let potId = invitation[0].pot
      update['$addToSet'] = { watchers: userId }
      delete update['status']
      Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        res.status(200).send({ message: 'Estado de la invitación actualizado' })
      })
    } else {
      res.status(200).send({ message: 'Estado de la invitación actualizado' })
    }
  })
}

function resetPassword (req, res) {
  let email = req.body.email
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lightup.utfsm@gmail.com',
      pass: 'LightUpUTFSM'
    }
  })

  User.findOne({email: email}, (err, user) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!user) return res.status(404).send({ message: 'El usuario no existe', code: 404 })

    let newPassword = Math.random().toString(36).slice(-8)
    user.password = newPassword

    user.save((err) => {
      if (err) return res.status(500).send({ message: err.code })
      var mailOptions = {
        from: 'Smartcrop <do-not-reply@lightup.cl>',
        to: email,
        subject: 'Contraseña reestablecida',
        html: '<h3>Su contraseña en Smartcrop ha sido reestablecida</h3><br><p>Su nueva contraseña es: <b>' + newPassword + '</b></p><br><p>Por su seguridad, le recomendamos cambiar esta contraseña una vez ingresado al sistema.</p><br>Saludos,<br>El equipo de SmartCrop.'
      }
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return res.status(500).send({ message: err.message, code: err.code })
        } else {
          console.log('Message sent: ' + info.response)
          res.status(200).send({ message: 'Contraseña reestablecida y email enviado' })
        }
      })
    })
  })
}

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUser,
  getUserByEmailOrNickname,
  updateUser,
  deleteUser,
  getMyProfile,
  createInvitation,
  getInvitations,
  updateInvitationStatus,
  resetPassword
}
