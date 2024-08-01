const Movie = require('../models/movie')
const movieLib = require('../lib/movie')

const handleGetAllMovies = async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1
    const LIMIT = 5
    const skipValue = (page - 1) * LIMIT
    try {
        const movies = await Movie.find({}).skip(skipValue).limit(LIMIT)
        return res.json({status: 'success', data: {page, movies}})
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Internal server error'})
    }
    
}

const handleGetMovieById = async (req, res) => {
    const id = req.params.id
    try {
        const movie = await Movie.findById(id)
        return res.status(200).json({status: 'success', data: movie})
    } catch(error) {
        return res.status(404).json({status: 'error', message: 'Movie Not Found'})
    }
    
}

const handleCreateMovie = async (req, res) => {
    const safeParseResult = movieLib.validateCreateMovieInputs(req.body)

    if(safeParseResult.error) throw new error(safeParseResult.error)

    const { title, description, language } = safeParseResult.data

    try {
        const movie = await Movie.create({ title, description, language })
        return res.status(201).json({ status: 'success', data: { id: movie._id}})
    } catch (err) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
    
}


const handleUpdateMovieById = async (req, res) => {
    const movieId = req.params.id

    const safeParseResult = movieLib.validateCreateMovieInputs(req.body)

    if(safeParseResult.error) throw new error(safeParseResult.error)

    const { title, description, language } = safeParseResult.data

    try {
        const movie = await Movie.findByIdAndUpdate(
            movieId,
            { title, description, language },
            { new: true }
        )
        return res.status(200).json({ status: 'success', data: { id: movie._id}})
    } catch (err) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
}


const handleDeleteMovieById = async (req, res) => {
    const id = req.params.id
    try {
        await Movie.findByIdAndDelete(id)
        return res.status(200).json({status: 'success', message: 'Deleted successfully'})
    } catch(err) {
        return res.status(400).json({ status: 'error', message: 'Movie not found'})
    }
    
}



module.exports = { handleCreateMovie, handleGetAllMovies, handleGetMovieById, handleUpdateMovieById, handleDeleteMovieById }