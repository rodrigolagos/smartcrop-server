'use strict'

const express = require('express')
const potController = require('../controllers/pot')
const userController = require('../controllers/user')
const auth = require('../middlewares/auth')
const api = express.Router()

/**
 * @api {get} /pots List all pots
 * @apiName GetPots
 * @apiGroup Pot
 * @apiVersion 1.0.0
 *
 * @apiSuccess {Object[]} pots Pot's list (Array of Object).
 * @apiSuccess {ObjectId} pots._id Id of de pot.
 * @apiSuccess {String} pots.name Name of the plant in the pot.
 * @apiSuccess {Number} pots.humidity Actual humidity of the pot.
 * @apiSuccess {Number} pots.moisture Actual moisture of the pot.
 * @apiSuccess {Number} pots.roomTemperature Actual room temperature of the pot.
 * @apiSuccess {Number} pots.temperature Actual temperature of the pot.
 * @apiSuccess {ObjectId} pots.owner Id reference to the user who owns the pot.
 * @apiSuccess {ObjectId[]} pots.watchers List of id referencing to the users who are watching the pot (Array of ObjectId).
 * @apiSuccess {ObjectId[]} pots.requests List of id referencing to the users who are requesting to watch the pot (Array of ObjectId).
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *          "_id": "59d05fa98c737c082b26f795",
 *          "name": "Maceta",
 *          "humidity": 0,
 *          "moisture": 0,
 *          "roomTemperature": 0,
 *          "temperature": 0,
 *          "owner": "59d0672f52b92708727fa88e",
 *          "watchers": [
 *              "59d0ad97e77f0e097199bba8"
 *          ],
 *          "requests": []
 *      }
 *    ]
 * @apiSuccessExample Success (No pots):
 *     HTTP/1.1 200 OK
 *     {
 *      "message": "No existen pots"
 *     }
 *
 * @apiErrorExample Error:
 *     HTTP/1.1 500 Internal Server Error
 */

api.get('/pots', potController.getPots)
api.get('/pots/:potId', potController.getPot)
api.post('/pots', potController.createPot)
api.put('/pots/:potId', potController.updatePot)
api.delete('/pots/:potId', potController.deletePot)
api.get('/users/:userId/owner/pots', potController.getPotsByOwner)
api.get('/users/:userId/watcher/pots', potController.getPotsByWatcher)

api.put('/pots/:potId/requests/:requestId', potController.updateRequestStatus)

api.get('/users', userController.getUsers)
api.get('/users/:userId', userController.getUser)
api.post('/signup', userController.signUp)
api.post('/signin', userController.signIn)
api.get('/private', auth.isAuth, (req, res) => {
  res.status(200).send({message: `User: ${req.user} Autorizado`})
})
api.get('/me', userController.getMyProfile)

module.exports = api
