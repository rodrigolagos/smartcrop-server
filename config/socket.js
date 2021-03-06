'use strict'

const socketio = require('socket.io')
const User = require('../models/user')
let io

function listen (server) {
  io = socketio.listen(server)

  io.on('connection', (socket) => {
    console.log(`Alguien se ha conectados. Socket id: ${socket.id}`)

    socket.emit('welcome', { message: 'Bienvenido a Smartcrop' })

    socket.on('update user', (data) => {
      let update = {}
      update.socketId = socket.id
      User.findByIdAndUpdate(data.userId, update, { fields: '-__v -password', new: true }, (err, userUpdated) => {
        if (err) {
          console.log(err)
        }
      })
    })

    socket.on('change humidity', (data) => {
      io.sockets.emit('humidity', data)
    })

    socket.on('change moisture', (data) => {
      io.sockets.emit('moisture', data)
    })

    socket.on('change room temperature', (data) => {
      io.sockets.emit('room temperature', data)
    })

    socket.on('change temperature', (data) => {
      io.sockets.emit('temperature', data)
    })

    socket.on('action bomb', (data) => {
      io.sockets.emit('bomb', data)
    })

    socket.on('disconnect', () => {
      console.log(`El cliente ${socket.id} se ha desconectado.`)
    })
  })

  return io
}

module.exports = {
  listen, io
}
