'use strict'

const express = require('express')
const potController = require('../controllers/pot')
const userController = require('../controllers/user')
const auth = require('../middlewares/auth')
const api = express.Router()

api.get('/pots', potController.getPots)
api.get('/pots/:potId', potController.getPot)
api.post('/pots', potController.createPot)
api.put('/pots/:potId', potController.updatePot)
api.delete('/pots/:potId', potController.deletePot)
api.get('/users/:userId/owner/pots', potController.getPotsByOwner)
api.get('/users/:userId/watcher/pots', potController.getPotsByWatcher)

api.get('/users', userController.getUsers)
api.get('/users/:userId', userController.getUser)
api.post('/signup', userController.signUp)
api.post('/signin', userController.signIn)
api.get('/private', auth.isAuth, (req, res) => {
  res.status(200).send({message: `User: ${req.user} Autorizado`})
})

module.exports = api
