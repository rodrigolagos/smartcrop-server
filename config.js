module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB || 'mongodb://localhost:27017/smartcrop',
  SECRET_TOKEN: 'smartcrop-token'
}
