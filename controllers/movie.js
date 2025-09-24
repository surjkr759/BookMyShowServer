const Movie = require('../models/movie')
const movieLib = require('../lib/movie')   
const MovieSchedule = require('../models/movieSchedule')
const mongoose = require("mongoose")
const Theatre = require('../models/theatre');

const handleGetAllMovies = async (req, res) => {try {
    const { city } = req.query;

    if (!city) {
      const movies = await Movie.find({}).lean();
      return res.json({ status: 'success', data: { movies } });
    }

    // Find theatres in the requested city
    const theatreIds = await Theatre.find({ 'location.city': city, isActive: true })
      .distinct('_id');

    if (theatreIds.length === 0) {
      return res.json({ status: 'success', data: { movies: [] } });
    }

    // Find scheduled movies in those theatres
    const movieIds = await MovieSchedule.find({ theatreId: { $in: theatreIds } })
      .distinct('movieId');

    const movies = await Movie.find({ _id: { $in: movieIds.map(id => new mongoose.Types.ObjectId(id)) } });

    return res.json({ status: 'success', data: { movies } });

  } catch (error) {
    console.error('get movies by city error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

const handleGetMovieById = async (req, res) => {
    const id = req.params.id
    try {
        const movie = await Movie.findById(id)
        return res.status(200).json({ status: 'success', data: movie })
    } catch (error) {
        return res.status(404).json({ status: 'error', message: 'Movie Not Found' })
    }

}

const handleCreateMovie = async (req, res) => {
    const safeParseResult = movieLib.validateCreateMovieInputs(req.body)

    if(safeParseResult.error) {
        return res.status(400).json({ status: 'error', error: safeParseResult.error})
    }

    const { title, description, language, genre, releaseDate, imageUrl } = safeParseResult.data

    try {
        const movie = await Movie.create({ title, description, language, genre, releaseDate, imageUrl })
        return res.status(201).json({ status: 'success', data: { id: movie._id } })
    } catch (err) {
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }

}


const handleUpdateMovieById = async (req, res) => {
    const movieId = req.params.id

    const safeParseResult = movieLib.validateCreateMovieInputs(req.body)

    if (safeParseResult.error) throw new error(safeParseResult.error)

    const { title, description, language } = safeParseResult.data

    try {
        const movie = await Movie.findByIdAndUpdate(
            movieId,
            { title, description, language },
            { new: true }
        )
        return res.status(200).json({ status: 'success', data: { id: movie._id } })
    } catch (err) {
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
}


const handleDeleteMovieById = async (req, res) => {
    const id = req.params.id
    try {
        await Movie.findByIdAndDelete(id)
        return res.status(200).json({ status: 'success', message: 'Deleted successfully' })
    } catch (err) {
        return res.status(400).json({ status: 'error', message: 'Movie not found' })
    }

}


const handleGetMovieSchedule = async (req, res) => {
    const movieId = req.params.id
    const city = req.query.city; // optional ?city=Delhi
    const match = { movieId: new mongoose.Types.ObjectId(movieId), startTime: { $gte: new Date() } };

    const pipeline = [
    { $match: match },
    { $sort: { startTime: 1 } },
    {
        $lookup: {
        from: "theatres",
        localField: "theatreId",
        foreignField: "_id",
        as: "theatre"
        }
    },
    { $unwind: "$theatre" }
    ];

    if (city) {
    // filter schedules whose theatre.city matches requested city
    pipeline.push({ $match: { "theatre.city": city } });
    }

    const result = await MovieSchedule.aggregate(pipeline);

    return res.json({ status: 'success', data: { schedule: result}})
}


// GET /api/v1/movie/search?q=vedaa
const handleSearchMovies = async (req, res) => {
  try {
    const { q, city } = req.query;
    const titleFilter = q ? { title: { $regex: q, $options: 'i' } } : {};

    if (!city) {
      const movies = await Movie.find(titleFilter).limit(20);
      return res.json({ status: 'success', data: { movies } });
    }

    const theatreIds = await Theatre.find({ 'location.city': city, isActive: true }).distinct('_id');
    const movieIds = await MovieSchedule.find({ theatreId: { $in: theatreIds } }).distinct('movieId');

    const movies = await Movie.find({ _id: { $in: movieIds }, ...titleFilter }).limit(20);
    return res.json({ status: 'success', data: { movies } });

  } catch (err) {
    console.error('search movies error:', err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};


module.exports = { 
    handleCreateMovie, 
    handleGetAllMovies, 
    handleGetMovieById, 
    handleUpdateMovieById, 
    handleDeleteMovieById, 
    handleGetMovieSchedule,
    handleSearchMovies
 }