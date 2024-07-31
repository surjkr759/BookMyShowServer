const express = require('express')
const middleware = require('../middlewares/authentication')
const controller = require('../controllers/movie')

const router = express.Router()

router.get('/', controller.handleGetAllMovies)
router.get('/:id', controller.handleGetMovieById)

router.post('/', middleware.ensureAuthenticated(['admin']), controller.handleCreateMovie)

router.delete('/:id', middleware.ensureAuthenticated(['admin']), controller.handleDeleteMovieById)

//Yet to implement
router.put('/:id')

module.exports = router