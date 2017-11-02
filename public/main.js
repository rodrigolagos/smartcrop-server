/* global io, $ */

const socket = io.connect('http://localhost:8080', { forceNow: true })

socket.on('welcome', (data) => {
  console.log(data)
})

socket.on('humidity', (data) => {
  $('#humidity-value').html(data.message)
})

socket.on('moisture', (data) => {
  $('#moisture-value').html(data.message)
})

socket.on('room temperature', (data) => {
  $('#room-temperature-value').html(data.message)
})

socket.on('temperature', (data) => {
  $('#temperature-value').html(data.message)
})

socket.on('bomb', (data) => {
  console.log(data)
})

function changeHumidity () { // eslint-disable-line
  var newHumidity = $('#humidityInput').val()
  socket.emit('change humidity', {message: newHumidity})
  socket.emit('action bomb', {message: 'Activar bomba'})
  return false
}

function changeMoisture () { // eslint-disable-line
  var newMoisture = $('#moistureInput').val()
  socket.emit('change moisture', {message: newMoisture})
  socket.emit('action bomb', {message: 'Activar bomba'})
  return false
}

function changeRoomTemperature () { // eslint-disable-line
  var newRoomTemperature = $('#roomTemperatureInput').val()
  socket.emit('change room temperature', {message: newRoomTemperature})
  return false
}

function changeTemperature () { // eslint-disable-line
  var newTemperature = $('#temperatureInput').val()
  socket.emit('change temperature', {message: newTemperature})
  return false
}

function activateBomb () { // eslint-disable-line
  socket.emit('action bomb', 'Activar bomba,59fa7ae9d23faf60bbaea1ea')
  return false
}

function deactivateBomb () { // eslint-disable-line
  socket.emit('action bomb', 'Desactivar bomba,59fa7ae9d23faf60bbaea1ea')
  return false
}
