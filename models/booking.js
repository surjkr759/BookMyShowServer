const { Schema, model } = require('mongoose')

const bookingSchema = new Schema({
    scheduleId: {
        type: Schema.Types.ObjectId,
        ref: 'movieSchedule',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    transactionId: {
        type: String,
        required: true
    },
}, { timestamps: true })

const Booking = model('booking', bookingSchema)

module.exports = Booking