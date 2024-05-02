const { SerialPort } = require('serialport')

const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 115200 })

port.on('data', function(data) {
  console.log('Received data:', data.toString())
})

// Handle errors
port.on('error', function(err) {
  console.log('Error: ', err.message)
})
