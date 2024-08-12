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
        return res.status(200).json({ status: 'success', data: theatre})
    } catch(error) {
        return res.status(404).json({status: 'error', error: 'Thetre not found'})
    }
}

const handleCreateNewTheatre = async (req, res) => {
    const safeParseResult = theatreLib.validateNewTheatreCreation(req.body)

    if(safeParseResult.error) 
        return res.status(400).json({ status: 'error', error: safeParseResult.error})

    const { theatreName, location: {lat, lon, address}, isActive } = safeParseResult.data 

    try {
        const newTheatre = await Theatre.create({ 
            theatreName, 
            location: {lat, lon, address}, 
            isActive: isActive || true 
        })
        return res.status(201).json({status: 'success', data: { id: newTheatre._id }})
    } catch (err) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
}


const handleUpdateTheatreById = async (req, res) => {
    const theatreId = req.params.id

    const safeParseResult = theatreLib.validateNewTheatreCreation(req.body)

    if(safeParseResult.error) throw new error(safeParseResult.error)

    const { theatreName, location: {lat, lon, address}, isActive } = safeParseResult.data

    try {
        const theatre = await Theatre.findByIdAndUpdate(
            theatreId,
            { theatreName, location: {lat, lon, address}, isActive },
            { new: true }
        )
        return res.status(200).json({ status: 'success', data: { id: theatre._id}})
    } catch (err) {
        return res.status(500).json({status: 'error', error: 'Internal Server Error'})
    }
}


const handleDeleteTheatreById = async (req, res) => {
    try {
        await Theatre.findByIdAndDelete(req.params.id)
        return res.status(200).json({status: 'success', message: 'Theatre deleted successfully'})
    } catch (error) {
        return res.status(400).json({status: 'error', error: 'Theatre not found'})
    }
}


module.exports = { handleCreateNewTheatre, handleGetAllTheatres, handleGetTheatreById, handleUpdateTheatreById, handleDeleteTheatreById }