const MovieSchedule = require('../models/movieSchedule')
const movieScheduleLib = require('../lib/movieSchedule')


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


module.exports = { handleCreateMovieSchedule, handleGetAllMovieSchedules, handleGetMovieScheduleById, handleUpdateMovieScheduleById, handleDeleteMovieScheduleById }