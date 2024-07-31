const express = require('express')
const controller = require('../controllers/auth')

const router = express.Router()

router.get('/profile', controller.handleGetUserProfile)
router.post('/signup', controller.handleSignupRequest)
router.post('/signin', controller.handleSigninRequest)

module.exports = router