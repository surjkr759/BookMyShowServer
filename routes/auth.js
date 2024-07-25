const express = require('express')
const controller = require('../controllers/auth')

const router = express.Router()

router.post('/signup', controller.handleSignupRequest)

module.exports = router