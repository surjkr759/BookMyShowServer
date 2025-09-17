const express = require('express')
const { ensureAuthenticated } = require('../middlewares/authentication')
const controller = require('../controllers/movieSchedule')

const router = express.Router()

//Get all movie schedules
router.get('/bookings', ensureAuthenticated(['admin']), controller.handleGetAllBookings)

// user-only bookings page
router.get('/bookings/me', ensureAuthenticated(), controller.handleGetMyBookings)

router.get('/', controller.handleGetAllMovieSchedules)

router.get('/:id', controller.handleGetMovieScheduleById)

router.post('/', ensureAuthenticated(['admin']), controller.handleCreateMovieSchedule)

router.delete('/:id', ensureAuthenticated(['admin']), controller.handleDeleteMovieScheduleById)

router.put('/:id', ensureAuthenticated(['admin']), controller.handleUpdateMovieScheduleById)

//id==> schedule id
router.get('/:id/book', ensureAuthenticated(), controller.handleCreateBookingOrder)

// Confirm booking after Stripe redirects back (expects ?session_id=...)
router.get('/checkout/success', ensureAuthenticated(), controller.handleConfirmBooking)

module.exports = router