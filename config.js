module.exports = {
  port: process.env.PORT || 8080,
  db: process.env.MONGODB || 'mongodb://127.0.0.1:27017/smartcrop',
  SECRET_TOKEN: 'smartcrop-token'
}
