'use strict'

const mongoose = require('mongoose')
const app = require('./app')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const config = require('./config')

mongoose.connect(config.db, {useMongoClient: true}, (err, res) => {
  if (err) return console.log(`No se ha podido conectar a la base de datos: ${err}`)
  console.log('Conexión establecida a la base de datos')
})

io.on('connection', (socket) => {
  console.log(`Alguien se ha conectado. Socket id: ${socket.id}`)

  socket.emit('welcome', { message: 'Bienvenido a Smartcrop' })

  socket.on('change humidity', (data) => {
    io.sockets.emit('humidity', data)
  })

  socket.on('action bomb', (data) => {
    io.sockets.emit('bomb', data)
  })

  socket.on('disconnect', () => {
    console.log(`El cliente ${socket.id} se ha desconectado.`)
  })
})

server.listen(config.port, () => {
  console.log(`Smartcrop API running on port ${config.port}`)
})
