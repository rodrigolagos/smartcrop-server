const socket = io.connect('http://192.168.1.102:3000', { forceNow: true })

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
