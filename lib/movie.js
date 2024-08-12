const {z} = require('zod')

const validateCreateMovieInputs = (data) => {

    const parsedData = { ...data, releaseDate: new Date(data.releaseDate)}

    const schema = z.object({
        title: z.string(),
        description: z.string(),
        language: z.string(),
        genre: z.string(),
        releaseDate: z.date(),
        imageUrl: z.string(),
    })

    return schema.safeParse(parsedData)
} 


module.exports = { validateCreateMovieInputs }