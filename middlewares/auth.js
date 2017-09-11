'use strict'

const tokenService = require('../services/token')

function isAuth (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({message: 'Sin autorización'})
  }

  const token = req.headers.authorization.split(' ')[1]

  tokenService.decodeToken(token)
    .then(response => {
      req.user = response
      next()
    })
    .catch(response => {
      res.status(response.status).send({message: response.message})
    })
}

module.exports = {
  isAuth
}
