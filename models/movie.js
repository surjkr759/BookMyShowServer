const { Schema, model } = require('mongoose')

const movieSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true })

movieSchema.index({ title: 1 });

const Movie = model('movie', movieSchema)

module.exports = Movie