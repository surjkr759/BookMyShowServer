const {z} = require('zod')

const objectIdRegex = /^[0-9a-fA-f]{24}$/
const validateMovieScheduleCreation = (data) => {
    //Parse startTime string to a Date object
    const parsedData = { ...data, startTime: new Date(data.startTime)}

    const schema = z.object({
        movieId: z.string().regex(objectIdRegex, 'Invalid ObjectId'),
        theatreId: z.string().regex(objectIdRegex, 'Invalid ObjectId'),
        startTime: z.date(),
        price: z.number()
    })

    return schema.safeParse(parsedData)
}

module.exports = { validateMovieScheduleCreation }