'use strict'

const Pot = require('../models/pot')

function getPot (req, res) {
  let potId = req.params.potId

  Pot.findById(potId, (err, pot) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!pot) return res.status(404).send({ message: 'El pot no existe' })

    res.status(200).send({ pot })
  })
}

function getPots (req, res) {
  Pot.find({}, (err, pots) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    if (!pots) return res.status(404).send({ message: 'No existen pots' })

    res.status(200).send({ pots })
  })
}

function createPot (req, res) {
  console.log('POST /api/pots')
  console.log(req.body)

  let pot = Pot()
  pot.name = req.body.name
  pot.description = req.body.description

  pot.save((err, potStored) => {
    if (err) return res.status(500).send({ message: `Error al guardar pot: ${err}` })
    res.status(200).send({ pot: potStored })
  })
}

function updatePot (req, res) {
  let potId = req.params.potId
  let update = req.body

  Pot.findByIdAndUpdate(potId, update, { new: true }, (err, potUpdated) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    res.status(200).send({ pot: potUpdated })
  })
}

function deletePot (req, res) {
  let potId = req.params.potId

  Pot.findById(potId, (err, pot) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    pot.remove(err => {
      if (err) return res.status(500).send({ message: `Error al borrar pot: ${err}` })
      res.status(200).send({ message: 'El pot ha sido eliminado' })
    })
  })
}

module.exports = {
  getPot,
  getPots,
  createPot,
  updatePot,
  deletePot
}
