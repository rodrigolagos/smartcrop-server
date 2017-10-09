'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const hbs = require('express-handlebars')
const app = express()
const api = require('./routes/api')
const web = require('./routes/web')

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

module.exports = app
