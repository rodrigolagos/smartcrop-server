'use strict'

const mongoose = require('mongoose')

const returnMongoose = function (config) {
  mongoose.connect(config.db, {useMongoClient: true}, (err, res) => {
    if (err) return console.log(`No se ha podido conectar a la base de datos: ${err}`)
    console.log('Conexión establecida a la base de datos')
  })
  return mongoose
}

module.exports = returnMongoose
