'use strict'

const express = require('express')
const web = express.Router()

web.get('/', (req, res) => {
  console.log('Hola')
})

web.get('/privacy', (req, res) => {
  res.render('privacy', { pageTitle: 'Privacy Policy - Smartcrop' })
})

module.exports = web
