const MovieSchedule = require('../models/movieSchedule')
const User = require('../models/user')
const Movie = require('../models/movie')
const movieScheduleLib = require('../lib/movieSchedule')
const Booking = require('../models/booking')
const mongoose = require('mongoose')

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
        success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: `http://localhost:5173/movie/${schedule.movieId}`,
        customer_email: user.email,
        line_items: [
            {
                adjustable_quantity: { enabled: true },
                price_data: {
                    unit_amount: parseInt(schedule.price) * 100,
                    currency: 'INR',
                    product_data: {
                        name: movie.title,
                        description: `${movie.title} - ${new Date(schedule.startTime).toLocaleString()}`
                    }
                },
                quantity: 1,
            }
        ],
        metadata: {userId: req.user._id, scheduleId: `${schedule._id}`},
        mode: 'payment',
    })

    // console.log('Session URL:', session.url)

    return res.json({ status: 'success', data: { url: session.url }})
}

const handleConfirmBooking = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ status: 'error', message: 'session_id is required' });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) return res.status(404).json({ status: 'error', message: 'Session not found' });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ status: 'error', message: 'Payment not completed' });
    }

    // Read metadata set at checkout time
    const scheduleId = session.metadata?.scheduleId;
    const userId = session.metadata?.userId;
    const transactionId = session.payment_intent || session.id;

    if (!scheduleId || !userId) {
      return res.status(400).json({ status: 'error', message: 'Missing metadata in session' });
    }

    // Idempotency: don’t create duplicates for same txn
    const existing = await Booking.findOne({ transactionId });
    if (existing) {
      return res.json({ status: 'success', data: { booking: existing, existed: true } });
    }

    const booking = await Booking.create({ scheduleId, userId, transactionId });
    return res.json({ status: 'success', data: { booking } });
  } catch (err) {
    console.error('confirm booking error:', err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};


const handleGetMyBookings = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    // Join with schedules and movies for a friendly response
    const myBookings = await Booking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'movieschedules',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'schedule',
          pipeline: [
            // Join Movie
            {
              $lookup: {
                from: 'movies',
                localField: 'movieId',
                foreignField: '_id',
                as: 'movie'
              }
            },
            { $unwind: '$movie' },
            // Join Theatre
            {
              $lookup: {
                from: 'theatres',
                localField: 'theatreId',
                foreignField: '_id',
                as: 'theatre'
              }
            },
            { $unwind: '$theatre' }
          ]
        }
      },
      { $unwind: '$schedule' },
      { $sort: { createdAt: -1 } }
    ]);

    return res.json({ status: 'success', data: { bookings: myBookings } });
  } catch (err) {
    console.error('get my bookings error:', err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};


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


module.exports = { handleCreateMovieSchedule, handleGetAllMovieSchedules, handleGetMovieScheduleById, handleConfirmBooking, handleUpdateMovieScheduleById, handleDeleteMovieScheduleById, handleCreateBookingOrder, handleGetAllBookings, handleGetMyBookings }