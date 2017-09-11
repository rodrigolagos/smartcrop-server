'use strict'

const User = require('../models/user')
const tokenService = require('../services/token')
const bcrypt = require('bcrypt-nodejs')

function signUp (req, res) {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password
  })

  user.save((err) => {
    if (err) res.status(500).send({message: `Error al crear usuario: ${err}`})

    return res.status(200).send({token: tokenService.createToken(user)})
  })
}

function signIn (req, res) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({message: err})
    if (!user) return res.status(404).send({message: 'No existe el usuario'})

    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) return err
      if (!result) return res.status(500).send({message: 'Usuario o contraseña incorrectos'})

      req.user = user
      res.status(200).send({
        message: 'Logueado correctamente',
        token: tokenService.createToken(user)
      })
    })
  })
}

module.exports = {
  signUp,
  signIn
}
