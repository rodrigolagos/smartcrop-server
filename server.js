'use strict'

const app = require('./app').app // eslint-disable-line
const server = require('./app').server
const config = require('./config')
const mongoose = require('./config/mongoose')(config) // eslint-disable-line

server.listen(config.port, () => {
  console.log(`Smartcrop API running on port ${config.port}`)
})
