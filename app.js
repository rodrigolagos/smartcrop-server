'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const hbs = require('express-handlebars')
const app = express()
const server = require('http').Server(app)
const io = require('./config/socket').listen(server)
const web = require('./routes/web')
const api = require('./routes/api')

app.use(function (req, res, next) {
  req.io = io
  next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine('.hbs', hbs({
  defaultLayout: 'default',
  extname: '.hbs'
}))
app.set('view engine', '.hbs')

app.use(express.static('public'))
app.use('/scripts', express.static(path.join(__dirname, '/node_modules/')))

app.use('/api', api)
app.use('/', web)

module.exports = {app: app, server: server}
