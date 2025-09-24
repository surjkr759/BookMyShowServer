const Theatre = require('../models/theatre')
const theatreLib = require('../lib/theatre')


const handleGetAllTheatres = async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1
    const LIMIT = 10
    const skipValue = (page - 1) * LIMIT
    try {
        const theatres = await Theatre.find({}).skip(skipValue).limit(LIMIT)
        return res.status(200).json({ status: 'success', data: {page, theatres}})
    } catch(err) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
}


const handleGetTheatreById = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id)
        if (!theatre) return res.status(404).json({ status: 'error', error: 'Not Found' });
        return res.status(200).json({ status: 'success', data: theatre})
    } catch(error) {
        return res.status(404).json({status: 'error', error: 'Thetre not found'})
    }
}

const handleCreateNewTheatre = async (req, res) => {
    const safeParseResult = theatreLib.validateNewTheatreCreation(req.body)

    if(safeParseResult.error) 
        return res.status(400).json({ status: 'error', error: safeParseResult.error})

    try {
        const newTheatre = await Theatre.create(safeParseResult.data)
        return res.status(201).json({status: 'success', data: { theatre: newTheatre }})
    } catch (err) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
}


const handleUpdateTheatreById = async (req, res) => {
    try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theatre) return res.status(404).json({ status: 'error', error: 'Not Found' });
    return res.json({ status: 'success', data: { theatre } });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
}


const handleDeleteTheatreById = async (req, res) => {
    try {
        await Theatre.findByIdAndDelete(req.params.id)
        return res.status(200).json({status: 'success', message: 'Theatre deleted successfully'})
    } catch (error) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
}


const handleGetAllCities = async (req, res) => {
  try {
    const cities = (await Theatre.distinct('location.city', { isActive: true })).sort();
    return res.json({ status: 'success', data: { cities } });
  } catch (err) {
    console.error('cities fetch error:', err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};


module.exports = { 
    handleCreateNewTheatre, 
    handleGetAllTheatres, 
    handleGetTheatreById, 
    handleUpdateTheatreById, 
    handleDeleteTheatreById,
    handleGetAllCities, 
}