'use strict'

const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return err
      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})
const upload = multer({ storage: storage })

module.exports = upload
