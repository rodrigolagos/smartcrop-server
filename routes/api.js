'use strict'

const express = require('express')
const potController = require('../controllers/pot')
const userController = require('../controllers/user')
const auth = require('../middlewares/auth')
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})
const upload = multer({ storage: storage })
const api = express.Router()

api.get('/pots', potController.getPots)
api.get('/pots/:potId', potController.getPot)
api.post('/pots', potController.createPot)
api.put('/pots/:potId', potController.updatePot)
api.delete('/pots/:potId', potController.deletePot)
api.get('/users/:userId/owner/pots', potController.getPotsByOwner)
api.get('/users/:userId/watcher/pots', potController.getPotsByWatcher)

api.get('/pots/:potId/requests', potController.getRequests)
api.put('/pots/:potId/requests/:requestId', potController.updateRequestStatus)

api.get('/users/:userId/invitations', userController.getInvitations)
api.post('/users/:userId/invitations', userController.createInvitation)
api.put('/users/:userId/invitations/:invitationId', userController.updateInvitationStatus)

api.get('/users', userController.getUsers)
api.get('/users/:userId', userController.getUser)
api.get('/users/search/:userEmailOrNickname', userController.getUserByEmailOrNickname)
api.post('/signup', upload.single('avatar'), userController.signUp)
api.post('/signin', userController.signIn)
api.post('/reset-password', userController.resetPassword)
api.put('/users/:userId', upload.single('avatar'), userController.updateUser)
api.delete('/users/:userId', userController.deleteUser)
api.get('/private', auth.isAuth, (req, res) => {
  res.status(200).send({message: `User: ${req.user} Autorizado`})
})
api.get('/me', userController.getMyProfile)

module.exports = api
