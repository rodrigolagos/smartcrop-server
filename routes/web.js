'use strict'

const express = require('express')
const web = express.Router()

web.get('/', (req, res) => {
  console.log('Hola')
})

module.exports = web
