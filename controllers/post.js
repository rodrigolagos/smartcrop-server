'use strict'

const mongoose = require('mongoose')
const Post = require('../models/post')

function getPost (req, res) {
  let postId = req.params.postId

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).send({ message: 'El post no existe', code: 404 })
  }

  Post.findById(postId, '-__v', (err, post) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!post) return res.status(404).send({ message: 'El post no existe', code: 404 })

    res.status(200).send(post)
  })
}

function getPosts (req, res) {
  Post.find({}, '-__v', (err, posts) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    res.status(200).send(posts)
  })
}

function createPost (req, res) {
  let post = Post()
  post.author = req.body.author
  post.price = req.body.price
  post.type = req.body.type
  post.mode = req.body.mode
  post.text = req.body.text

  if (req.file !== undefined) {
    post.image = req.file.filename
  }

  post.save((err, postStored) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    res.status(201).send(post)
  })
}

function updatePost (req, res) {
  let postId = req.params.postId
  let update = req.body

  if (req.file !== undefined) {
    update.image = req.file.filename
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).send({ message: 'El post no existe', code: 404 })
  }

  Post.findByIdAndUpdate(postId, update, { fields: '-__v', new: true, runValidators: true }, (err, postUpdated) => {
    if (err) return res.status(500).send({ message: `Error al realizar petición: ${err}` })
    res.status(200).send(postUpdated)
  })
}

function deletePost (req, res) {
  let postId = req.params.postId

  Post.findById(postId, (err, post) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    post.remove(err => {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send({ message: 'El post ha sido eliminado' })
    })
  })
}

module.exports = {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost
}
