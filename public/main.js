const socket = io.connect('http://localhost:3000', { forceNow: true })

socket.on('welcome', (data) => {
  console.log(data)
})

socket.on('humidity', (data) => {
  $('#humidity-value').html(data)
})

function changeHumidity () {
  var newHumidity = $('#humidityInput').val()
  socket.emit('change humidity', newHumidity)
  return false
}
