'use strict'

const User = require('../models/user')
const tokenService = require('../services/token')
const bcrypt = require('bcrypt-nodejs')

function getUser (req, res) {
  let userId = req.params.userId

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!user) return res.status(404).send({ message: 'El usuario no existe' })

    res.status(200).send({ user })
  })
}

function getUsers (req, res) {
  User.find({}, (err, users) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!users) return res.status(404).send({ message: 'No existen usuarios' })

    res.status(200).send({ users })
  })
}

function signUp (req, res) {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password
  })

  user.save((err) => {
    if (err) return res.status(500).send({message: `Error al crear usuario: ${err}`})

    return res.status(200).send({message: 'Usuario creado correctamente', user: user, token: tokenService.createToken(user)})
  })
}

function signIn (req, res) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({message: err})
    if (!user) return res.status(404).send({message: 'No existe el usuario'})

    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) return err
      if (!result) return res.status(401).send({message: 'Usuario o contraseña incorrectos'})

      req.user = user
      res.status(200).send({
        message: 'Logueado correctamente',
        user: user,
        token: tokenService.createToken(user)
      })
    })
  })
}

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUser
}
