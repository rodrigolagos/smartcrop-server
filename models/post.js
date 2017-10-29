'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = Schema({
  author: {type: Schema.ObjectId, ref: 'User'},
  price: Number,
  type: { type: String, enum: ['social', 'sale'], default: 'social' },
  mode: { type: String, enum: ['public', 'private'], default: 'public' },
  image: String,
  text: String,
  likes: [{
    user: { type: Schema.ObjectId, ref: 'User' }
  }],
  comments: [{
    author: { type: Schema.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

module.exports = mongoose.model('Post', PostSchema)
