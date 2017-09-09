/* global io, $ */

const socket = io.connect('http://localhost:3000', { forceNow: true })

socket.on('welcome', (data) => {
  console.log(data)
})

socket.on('humidity', (data) => {
  $('#humidity-value').html(data.message)
})

socket.on('bomb', (data) => {
  console.log(data)
})

function changeHumidity () { // eslint-disable-line
  var newHumidity = $('#humidityInput').val()
  socket.emit('change humidity', {message: newHumidity})
  return false
}

function activateBomb () { // eslint-disable-line
  socket.emit('activate bomb', {message: 'Activar bomba'})
  return false
}
