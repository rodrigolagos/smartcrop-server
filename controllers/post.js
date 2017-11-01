'use strict'

const mongoose = require('mongoose')
const Post = require('../models/post')
const User = require('../models/user')

function getPost (req, res) {
  let postId = req.params.postId

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).send({ message: 'El post no existe', code: 404 })
  }

  Post.findById(postId, '-__v', (err, post) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!post) return res.status(404).send({ message: 'El post no existe', code: 404 })

    User.populate(post, [{ path: 'author', select: '-__v -password -invitations' }, { path: 'comments.author', select: '-__v -password -invitations' }], function (err, post) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(post)
    })
  })
}

function getPosts (req, res) {
  Post.find({}, '-__v', (err, posts) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    User.populate(posts, [{ path: 'author', select: '-__v -password -invitations' }, { path: 'comments.author', select: '-__v -password -invitations' }], function (err, posts) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(posts)
    })
  })
}

function getPostsByTag (req, res) {
  let tag = req.params.tag

  Post.find({tags: {$regex: tag, $options: 'i'}}, '-__v', (err, posts) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    User.populate(posts, [{ path: 'author', select: '-__v -password -invitations' }, { path: 'comments.author', select: '-__v -password -invitations' }], function (err, posts) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(posts)
    })
  })
}

function getPublicPosts (req, res) {
  Post.find({mode: 'public', type: 'social'}, '-__v', (err, posts) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    User.populate(posts, [{ path: 'author', select: '-__v -password -invitations' }, { path: 'comments.author', select: '-__v -password -invitations' }], function (err, posts) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(posts)
    })
  })
}

function getSalePosts (req, res) {
  Post.find({type: 'sale'}, '-__v', (err, posts) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    User.populate(posts, [{ path: 'author', select: '-__v -password -invitations' }, { path: 'comments.author', select: '-__v -password -invitations' }], function (err, posts) {
      if (err) return res.status(500).send({ message: err.message, code: err.code })
      res.status(200).send(posts)
    })
  })
}

function createPost (req, res) {
  let post = Post()
  post.author = req.body.author
  post.price = req.body.price
  post.type = req.body.type
  post.mode = req.body.mode
  post.text = req.body.text

  if (req.body.tags !== undefined) {
    console.log(req.body.tags.split(',').length)
    if (req.body.tags !== '') {
      post.tags = req.body.tags.split(',')
    }
  }

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

function createComment (req, res) {
  let postId = req.params.postId
  let author = req.body.author
  let text = req.body.text
  let createdAt = Date.now()
  let updatedAt = Date.now()
  let update = {}

  update['$push'] = { comments: { author: author, text: text, createdAt: createdAt, updatedAt: updatedAt } }
  Post.findByIdAndUpdate(postId, update, { fields: '-__v -password', new: true }, (err, postUpdated) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    res.status(200).send({ message: 'Post actualizado correctamente', post: postUpdated })
  })
}

function updateComment (req, res) {
  let postId = req.params.postId
  let commentId = req.params.commentId

  Post.findOneAndUpdate({_id: postId, 'comments._id': commentId}, {$set: {'comments.$.text': req.body.text, 'comments.$.updatedAt': Date.now()}}, { new: true }, (err, postUpdated) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    res.status(200).send({ message: 'Comentario actualizado' })
  })
}

function deleteComment (req, res) {
  let postId = req.params.postId
  let commentId = req.params.commentId

  Post.findOneAndUpdate({_id: postId}, {$pull: { 'comments': { '_id': commentId } }}, { new: true, safe: true, multi: true }, (err, postUpdated) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })

    res.status(200).send({ message: 'Comentario eliminado' })
  })
}

function createLike (req, res) {
  let postId = req.params.postId
  let userId = req.body.userId

  Post.findById(postId, (err, post) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!post) return res.status(404).send({message: 'No existe el post', code: 404})

    let likers = post.likers.toString()
    if (likers.indexOf(userId) === -1) {
      Post.findByIdAndUpdate(postId, { $addToSet: {likers: userId}, $inc: {likes: 1} }, { fields: '-__v', new: true }, (err, postUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })
        if (!postUpdated) return res.status(404).send({message: 'No existe el post', code: 404})

        res.status(200).send({ message: 'Like agregado correctamente', post: postUpdated })
      })
    } else {
      return res.status(403).send({ message: 'Ya le has dado like a este post', code: 403 })
    }
  })
}

function deleteLike (req, res) {
  let postId = req.params.postId
  let userId = req.body.userId

  Post.findById(postId, (err, post) => {
    if (err) return res.status(500).send({ message: err.message, code: err.code })
    if (!post) return res.status(404).send({message: 'No existe el post', code: 404})

    let likers = post.likers.toString()
    if (likers.indexOf(userId) === -1) {
      return res.status(403).send({ message: 'Aun no le das like a este post', code: 403 })
    } else {
      Post.findOneAndUpdate({_id: postId}, {$pull: { 'likers': userId }, $inc: {likes: -1}}, { new: true, safe: true, multi: true }, (err, postUpdated) => {
        if (err) return res.status(500).send({ message: err.message, code: err.code })

        res.status(200).send({ message: 'Like eliminado', post: postUpdated })
      })
    }
  })
}

module.exports = {
  getPost,
  getPosts,
  getPostsByTag,
  getPublicPosts,
  getSalePosts,
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
  createLike,
  deleteLike
}
