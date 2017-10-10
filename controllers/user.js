'use strict'

const User = require('../models/user')
const tokenService = require('../services/token')
const bcrypt = require('bcrypt-nodejs')

function getUser (req, res) {
  let userId = req.params.userId

  User.findById(userId, '-__v -password', (err, user) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!user) return res.status(404).send({ message: 'El usuario no existe', code: 404 })

    res.status(200).send(user)
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
        return res.status(409).send({ message: field + ' already exists.', code: 409 })
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

function getMyProfile (req, res) {
  if (!req.headers.authorization) {
    return res.status(403).send({message: 'Sin autorización'})
  }

  const token = req.headers.authorization.split(' ')[1]

  tokenService.decodeToken(token)
    .then(response => {
      let userId = response

      User.findById(userId, '-__v -password', (err, user) => {
        if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
        if (!user) return res.status(404).send({ message: 'El usuario no existe' })

        res.status(200).send(user)
      })
    })
    .catch(response => {
      res.status(response.status).send({message: response.message})
    })
}

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUser,
  getMyProfile
}
