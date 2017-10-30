'use strict'

const express = require('express')
const potController = require('../controllers/pot')
const userController = require('../controllers/user')
const plantController = require('../controllers/plant')
const postController = require('../controllers/post')
const auth = require('../middlewares/auth')
const upload = require('../config/multer')
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

api.put('/users/:userId/avatar', upload.single('avatar'), userController.updateUserAvatar)

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

api.get('/plants', plantController.getPlants)
api.get('/plants/:plantId', plantController.getPlant)
api.post('/plants', plantController.createPlant)
api.put('/plants/:plantId', plantController.updatePlant)
api.delete('/plants/:plantId', plantController.deletePlant)

api.get('/posts', postController.getPosts)
api.get('/posts/:postId', postController.getPost)
api.post('/posts', upload.single('image'), postController.createPost)
api.put('/posts/:postId', upload.single('image'), postController.updatePost)
api.delete('/posts/:postId', postController.deletePost)

module.exports = api
