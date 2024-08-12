const MovieSchedule = require('../models/movieSchedule')
const User = require('../models/user')
const Movie = require('../models/movie')
const movieScheduleLib = require('../lib/movieSchedule')
const Booking = require('../models/booking')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const handleGetAllMovieSchedules = async (req, res) => {
    try {
        const movieSchedules = await MovieSchedule.find({})
        return res.status(200).json({status: 'success', data: movieSchedules})
    } catch (error) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
}

const handleGetMovieScheduleById = async (req, res) => {
    try {
        const movieSchedule = await MovieSchedule.findById(req.params.id)
        return res.status(200).json({status: 'success', data: movieSchedule})
    } catch (error) {
        return res.status(500).json({status: 'error', error: 'Movie Schedule Not Found'})
    }
}


const handleCreateMovieSchedule = async (req, res) => {
    const safeParseResult = movieScheduleLib.validateMovieScheduleCreation(req.body)

    if(safeParseResult.error)
        return res.status(400).json({status: 'error', error: safeParseResult.error})

    const { movieId, theatreId, startTime, price } = safeParseResult.data

    try {
        const newMovieSchedule = await MovieSchedule.create({ movieId, theatreId, startTime, price })
        return res.status(201).json({status: 'success', data: {id: newMovieSchedule._id}})
    } catch(error) {
        return res.status(500).json({status: 'error', error: 'Internal server error'})
    }
}


const handleUpdateMovieScheduleById = async (req, res) => {
    const movieScheduleId = req.params.id
    const safeParseResult = movieScheduleLib.validateMovieScheduleCreation(req.body)

    if(safeParseResult.error)
        return res.status(400).json({status: 'error', error: safeParseResult.error})

    const { movieId, theatreId, startTime, price } = safeParseResult.data

    try {
        const updatedMovieSchedule = await MovieSchedule.findByIdAndUpdate(
            movieScheduleId,
            { movieId, theatreId, startTime, price },
            { new: true }
        )
        return res.status(201).json({status: 'success', data: {id: updatedMovieSchedule._id}})
    } catch(error) {
        return res.status(500).json({status: 'error', error: 'Internal server error'})
    }
}


const handleDeleteMovieScheduleById = async (req, res) => {
    try {
        await MovieSchedule.findByIdAndDelete(req.params.id)
        return res.status(200).json({status: 'success', message: 'Movie Schedule deleted successfully'})
    } catch (error) {
        return res.status(500).json({status: 'error', error: 'Movie Schedule Not Found'})
    }
}


const handleCreateBookingOrder = async (req, res) => {
    const scheduleId = req.params.id
    const schedule = await MovieSchedule.findById(scheduleId)
    const user = await User.findById(req.user._id)
    const movie = await Movie.findById(schedule.movieId)

    if(!schedule)
        return res.status(404).json({status: 'error', message: 'Movie Schedule not found'})
    else if(schedule && new Date().toLocaleString() > schedule.startTime)
        return res.status(400).json({ status: 'error', message: 'Booking not allowed for a past schedule'})

    const session = await stripe.checkout.sessions.create({
        success_url: 'http://localhost:5173/success',
        // return_url: `http://localhost:5173/movie/${schedule.movieId}`,
        customer_email: user.email,
        line_items: [
            {
                adjustable_quantity: { enabled: true },
                price_data: {
                    unit_amount: parseInt(schedule.price) * 100,
                    currency: 'INR',
                    product_data: {
                        name: movie.title
                    }
                },
                quantity: 1,
            }
        ],
        metadata: {userId: req.user._id, scheduleId: `${schedule._id}`},
        mode: 'payment',
    })

    // console.log('Session URL:', session.url)

    return res.json({ status: 'success', data: session})
}


const handleGetAllBookings = async (req, res) => {
    const allBookings = await Booking.aggregate([
        {
          '$lookup': {
            'from': 'users', 
            'localField': 'userId', 
            'foreignField': '_id', 
            'as': 'user'
          }
        }, {
          '$unwind': {
            'path': '$user', 
            'preserveNullAndEmptyArrays': false
          }
        }, {
          '$lookup': {
            'from': 'movieschedules', 
            'localField': 'scheduleId', 
            'foreignField': '_id', 
            'as': 'schedule', 
            'pipeline': [
              {
                '$lookup': {
                  'from': 'movies', 
                  'localField': 'movieId', 
                  'foreignField': '_id', 
                  'as': 'movie'
                }
              }, {
                '$unwind': {
                  'path': '$movie'
                }
              }, {
                '$lookup': {
                  'from': 'theatres', 
                  'localField': 'theatreId', 
                  'foreignField': '_id', 
                  'as': 'theatre'
                }
              }, {
                '$unwind': {
                  'path': '$theatre'
                }
              }
            ]
          }
        }, {
          '$unwind': {
            'path': '$schedule'
          }
        }
      ])

      return res.json({data: {bookings: allBookings}})
}


module.exports = { handleCreateMovieSchedule, handleGetAllMovieSchedules, handleGetMovieScheduleById, handleUpdateMovieScheduleById, handleDeleteMovieScheduleById, handleCreateBookingOrder, handleGetAllBookings }