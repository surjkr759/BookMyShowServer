const express = require('express')
const { ensureAuthenticated } = require('../middlewares/authentication')
const controller = require('../controllers/theatre')

const router = express.Router()


router.get('/', controller.handleGetAllTheatres)
router.get('/:id', controller.handleGetTheatreById)

router.post('/', ensureAuthenticated(['admin']), controller.handleCreateNewTheatre)

router.delete('/:id', controller.handleDeleteTheatreById)

router.put('/:id', ensureAuthenticated(['admin']), controller.handleUpdateTheatreById)



module.exports = router