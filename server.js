'use strict'

const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config')

mongoose.connect(config.db, (err, res) => {
  if (err) return console.log(`No se ha podido conectar a la base de datos: ${err}`)
  console.log('Conexión establecida a la base de datos')
})

app.listen(config.port, () => {
  console.log(`Smartcrop API running on port ${config.port}`)
})
